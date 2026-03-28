// ── Database row types (mirrors supabase-schema.sql) ────────

export type DbShop = {
    id: string;
    name: string;
    location: string | null;
    created_at: string;
};

export type DbItem = {
    id: string;
    shop_id: string;
    title: string;
    description: string | null;
    price_amount: number;   // minor units (e.g. MWK tambala)
    currency: string;
    image_url: string | null;
    in_stock: boolean;
    created_at: string;
};

export type DbIntent = {
    id: string;
    item_id: string;
    sender_phone: string;
    recipient_phone: string;
    message: string | null;
    claim_code: string;     // unique 6-character code
    status: "created" | "payment_submitted" | "paid" | "redeemed";
    created_at: string;
    redeemed_at: string | null;
};

// ── Joined view used by the home page ───────────────────────

export type FeedItem = {
    id: string;
    shop: string;           // denormalised shop name
    title: string;
    description: string | null;
    price: string;          // formatted, e.g. "MWK 18,000"
    eta: string;
    image_url: string | null;
};

// ── Helpers ─────────────────────────────────────────────────

/** Format minor-unit amount → human price, e.g. 18000 → "MWK 18,000" */
export function formatPrice(amount: number, currency = "MWK"): string {
    return `${currency} ${amount.toLocaleString("en")}`;
}
