import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Lazy singleton ──────────────────────────────────────────
// The client is created on first use, NOT at import time.
// This keeps `next build` safe when env vars aren't set yet.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (_client) return _client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error(
            "Missing Supabase env vars – copy .env.local.example → .env.local and fill in your project values."
        );
    }

    _client = createClient(url, key);
    return _client;
}
