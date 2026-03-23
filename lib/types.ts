// ── Database row types (mirrors supabase-schema.sql) ────────

export type DbShop = {
    id: string;
    name: string;
    description: string | null;
    owner_id: string | null;
    created_at: string;
};

export type DbItem = {
    id: string;
    shop_id: string;
    title: string;
    price_amount: number;   // minor units (e.g. tambala)
    currency: string;
    eta: string | null;
    in_stock: boolean;
    created_at: string;
};

// ── Joined view used by the home page ───────────────────────

export type FeedItem = {
    id: string;
    shop: string;           // denormalised shop name
    title: string;
    price: string;          // formatted, e.g. "MWK 18,000"
    eta: string;
    image_url: string | null;
};

// ── Helpers ─────────────────────────────────────────────────

/** Format minor-unit amount → human price, e.g. 18000 → "MWK 18,000" */
export function formatPrice(amount: number, currency = "MWK"): string {
    return `${currency} ${amount.toLocaleString("en")}`;
}
