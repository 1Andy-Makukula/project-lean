-- ============================================================
-- KithLy MVP — Seed Data
-- Run this AFTER supabase-schema.sql to populate test data.
-- ============================================================

BEGIN;

-- 1. Shops
INSERT INTO public.shops (id, name, location)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'KithLy Supermarket', 'Lilongwe, Area 47'),
  ('44444444-4444-4444-4444-444444444444', 'Tech Hub', 'Blantyre, Chichiri')
ON CONFLICT (id) DO NOTHING;

-- 2. Items
INSERT INTO public.items (id, shop_id, title, price_amount, currency, image_url, in_stock)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Essential Groceries Bundle', 18000, 'ZMW', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', true),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Fresh Fruit Basket', 12000, 'ZMW', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80', true),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Wireless Earbuds', 35000, 'ZMW', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Test Intent (for the /claim/TEST01 route)
INSERT INTO public.intents (id, item_id, sender_phone, recipient_phone, claim_code, status, message)
VALUES
  ('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '+265999000111', '+265999000222', 'TEST01', 'paid', 'Enjoy these groceries!')
ON CONFLICT (id) DO NOTHING;

COMMIT;
