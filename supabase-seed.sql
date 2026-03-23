-- ============================================================
-- KithLy Phase 1 — Supabase Seed Data
-- Run this in the Supabase SQL Editor to test the UI locally.
-- ============================================================

BEGIN;

-- 1. Insert Test Users
INSERT INTO public.users (id, phone, display_name)
VALUES
  ('11111111-1111-1111-1111-111111111111', '+265999000111', 'Alice Sender'),
  ('22222222-2222-2222-2222-222222222222', '+265999000222', 'Bob Recipient')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Test Shops
INSERT INTO public.shops (id, name, description, owner_id)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'KithLy Supermarket', 'Your local fresh market', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444444', 'Tech Hub', 'Gadgets and accessories', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Test Items
INSERT INTO public.items (id, shop_id, title, price_amount, currency, eta, in_stock, image_url)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Essential Groceries Bundle', 18000, 'MWK', 'Redeem today', true, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Fresh Fruit Basket', 12000, 'MWK', 'Redeem today', true, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80'),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Wireless Earbuds', 35000, 'MWK', 'Redeem in 24h', true, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Test Intent (for the Demo /claim/TEST01 route)
INSERT INTO public.intents (id, sender_id, recipient_id, item_id, claim_code, status, message)
VALUES
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'TEST01', 'paid', 'Enjoy these groceries!')
ON CONFLICT (id) DO NOTHING;

COMMIT;
