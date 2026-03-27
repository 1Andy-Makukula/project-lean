import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Lazy singleton ──────────────────────────────────────────
// Created on first call, NOT at import time.
// Keeps `next build` safe when env vars aren't injected yet.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (_client) return _client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error(
            "[KithLy] Missing Supabase env vars.\n" +
            "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
        );
    }

    _client = createClient(url, key);
    return _client;
}
