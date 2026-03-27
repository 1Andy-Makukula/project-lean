-- ============================================================
-- KithLy MVP — PostgreSQL Schema for Supabase
-- Paste this into your Supabase SQL Editor and click "Run".
-- ============================================================

-- ── 1. SHOPS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shops (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    location   TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. ITEMS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id      UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    price_amount INTEGER NOT NULL,          -- minor units (e.g. MWK tambala)
    currency     TEXT NOT NULL DEFAULT 'MWK',
    image_url    TEXT,
    in_stock     BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. INTENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    sender_phone    TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    message         TEXT,
    claim_code      TEXT NOT NULL UNIQUE,    -- 6-character code, e.g. "A1B2C3"
    status          TEXT NOT NULL DEFAULT 'created'
                    CHECK (status IN ('created', 'payment_submitted', 'paid', 'redeemed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    redeemed_at     TIMESTAMPTZ
);

-- ── 4. ROW LEVEL SECURITY ───────────────────────────────────
-- Enable RLS on all tables, then add permissive policies for
-- public read/write. This is fine for a controlled MVP test.

ALTER TABLE public.shops   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intents ENABLE ROW LEVEL SECURITY;

-- shops: public read & write
CREATE POLICY "shops_select" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_insert" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "shops_update" ON public.shops FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "shops_delete" ON public.shops FOR DELETE USING (true);

-- items: public read & write
CREATE POLICY "items_select" ON public.items FOR SELECT USING (true);
CREATE POLICY "items_insert" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "items_update" ON public.items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "items_delete" ON public.items FOR DELETE USING (true);

-- intents: public read & write
CREATE POLICY "intents_select" ON public.intents FOR SELECT USING (true);
CREATE POLICY "intents_insert" ON public.intents FOR INSERT WITH CHECK (true);
CREATE POLICY "intents_update" ON public.intents FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "intents_delete" ON public.intents FOR DELETE USING (true);

-- ── 5. INDEXES ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_items_shop_id    ON public.items(shop_id);
CREATE INDEX IF NOT EXISTS idx_items_in_stock   ON public.items(in_stock);
CREATE INDEX IF NOT EXISTS idx_intents_item_id  ON public.intents(item_id);
CREATE INDEX IF NOT EXISTS idx_intents_code     ON public.intents(claim_code);
CREATE INDEX IF NOT EXISTS idx_intents_status   ON public.intents(status);
