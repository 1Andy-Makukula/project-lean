-- ============================================================
-- KithLy Phase 1 — Supabase Schema
-- Run this in the Supabase SQL Editor (one shot)
-- ============================================================

-- 0. Extensions
-- ────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";          -- gen_random_uuid()

-- 1. Custom types
-- ────────────────────────────────────────────────────────────
create type intent_status as enum (
  'created',
  'payment_submitted',
  'paid',
  'redeemed'
);

-- 2. Users
-- ────────────────────────────────────────────────────────────
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  phone         text unique not null,
  display_name  text not null,
  created_at    timestamptz not null default now()
);

comment on table public.users is 'KithLy platform users (senders + recipients).';

-- 3. Shops
-- ────────────────────────────────────────────────────────────
create table public.shops (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  owner_id      uuid references public.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

comment on table public.shops is 'Local shops that list redeemable items.';

-- 4. Items
-- ────────────────────────────────────────────────────────────
create table public.items (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references public.shops(id) on delete cascade,
  title         text not null,
  price_amount  integer not null,                   -- stored in minor units (e.g. tambala / ngwee)
  currency      text not null default 'MWK',
  eta           text,                               -- human-readable ("Redeem today")
  in_stock      boolean not null default true,
  image_url     text,                               -- URL path to local or remote image
  created_at    timestamptz not null default now()
);

comment on table public.items is 'Gift-able items listed by shops.';

-- 5. Unique 6-character claim code generator
-- ────────────────────────────────────────────────────────────
create or replace function generate_claim_code()
returns text
language plpgsql
as $$
declare
  chars  text   := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   -- no I/1/O/0 to avoid confusion
  code   text   := '';
  i      int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    -- Ensure uniqueness
    exit when not exists (select 1 from public.intents where claim_code = code);
  end loop;
  return code;
end;
$$;

-- 6. Intents
-- ────────────────────────────────────────────────────────────
create table public.intents (
  id              uuid primary key default gen_random_uuid(),
  sender_id       uuid not null references public.users(id) on delete cascade,
  recipient_id    uuid references public.users(id) on delete set null,
  item_id         uuid not null references public.items(id) on delete cascade,
  claim_code      text unique not null default generate_claim_code(),
  status          intent_status not null default 'created',
  message         text,                              -- optional gift message
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.intents is
  'A gift intent: sender pays for an item, recipient redeems with claim_code.';

-- 7. Auto-update updated_at on intents
-- ────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_intents_updated_at
  before update on public.intents
  for each row
  execute function set_updated_at();

-- 8. Indexes
-- ────────────────────────────────────────────────────────────
create index idx_items_shop      on public.items(shop_id);
create index idx_intents_sender  on public.intents(sender_id);
create index idx_intents_status  on public.intents(status);
create index idx_intents_code    on public.intents(claim_code);

-- 9. Row Level Security (enable, then add policies per role later)
-- ────────────────────────────────────────────────────────────
alter table public.users   enable row level security;
alter table public.shops   enable row level security;
alter table public.items   enable row level security;
alter table public.intents enable row level security;

-- Allow the service_role (used server-side) full access.
-- Fine-grained user policies will be added in later phases.
create policy "Service role full access" on public.users
  for all using (true) with check (true);

create policy "Service role full access" on public.shops
  for all using (true) with check (true);

create policy "Service role full access" on public.items
  for all using (true) with check (true);

create policy "Service role full access" on public.intents
  for all using (true) with check (true);
