"use server";

import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/types";

export type RedeemState = {
    error?: string;
    success?: boolean;
    itemTitle?: string;
    message?: string;
};

export async function submitRedeemCode(
    _prev: RedeemState,
    formData: FormData
): Promise<RedeemState> {
    let code = (formData.get("code") as string)?.trim();

    if (!code) {
        return { error: "Please enter a 6-character claim code." };
    }

    code = code.toUpperCase(); // DB codes are uppercase

    const supabase = getSupabase();

    // ── Find the intent by claim code ───────────────────────
    const { data: intent, error: findErr } = await supabase
        .from("intents")
        .select(`
            id,
            status,
            items ( title )
        `)
        .eq("claim_code", code)
        .single();

    if (findErr || !intent) {
        return { error: "Invalid claim code. Please check and try again." };
    }

    // ── Validation based on status ──────────────────────────
    if (intent.status === "redeemed") {
        return { error: "This code has already been redeemed." };
    }

    if (intent.status === "created" || intent.status === "payment_submitted") {
        return { error: "Payment has not been confirmed for this intent yet." };
    }

    if (intent.status !== "paid") {
        return { error: `Invalid intent state: ${intent.status}` };
    }

    // ── Update to redeemed ──────────────────────────────────
    const { error: updateErr } = await supabase
        .from("intents")
        .update({ status: "redeemed" })
        .eq("id", intent.id)
        .eq("status", "paid"); // concurrency safety check

    if (updateErr) {
        console.error("[KithLy] Failed to redeem intent:", updateErr.message);
        return { error: "System error: Could not redeem the item. Try again." };
    }

    const itemTitle = Array.isArray(intent.items)
        ? (intent.items[0] as any)?.title
        : (intent.items as any)?.title;

    return {
        success: true,
        itemTitle: itemTitle || "Item",
        message: "✅ Valid. Give item to customer.",
    };
}

export async function verifyShopPin(pin: string) {
    const supabase = getSupabase();

    const { data: shop, error } = await supabase
        .from("shops")
        .select("id, name")
        .eq("pin_code", pin)
        .single();

    if (error || !shop) return null;
    return { id: shop.id, name: shop.name };
}

export type ShopDashboardMetrics = {
    revenue: number;
    totalSales: number;
    items: {
        id: string;
        title: string;
        price: string;
        imageUrl: string | null;
        inStock: boolean;
    }[];
};

export async function getShopMetrics(shopId: string): Promise<ShopDashboardMetrics | null> {
    const supabase = getSupabase();

    // 1. Fetch items belonging to this shop
    const { data: items, error: itemsErr } = await supabase
        .from("items")
        .select("id, title, price_amount, currency, image_url, in_stock")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

    if (itemsErr) {
        console.error("[KithLy] Shop items fetch error:", itemsErr.message);
        return null;
    }

    const formattedItems = (items || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: formatPrice(item.price_amount, item.currency),
        imageUrl: item.image_url,
        inStock: item.in_stock,
    }));

    // 2. Fetch intents linked to those items with status 'paid' or 'redeemed'
    const { data: intents, error: intentsErr } = await supabase
        .from("intents")
        .select(`
            status,
            items!inner ( id, shop_id, price_amount )
        `)
        .eq("items.shop_id", shopId)
        .in("status", ["paid", "redeemed"]);

    if (intentsErr) {
        console.error("[KithLy] Shop intents fetch error:", intentsErr.message);
        return null;
    }

    let revenue = 0;
    (intents || []).forEach((intent: any) => {
        const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
        revenue += (itemData as any)?.price_amount || 0;
    });

    return {
        revenue,
        totalSales: (intents || []).length,
        items: formattedItems,
    };
}
