"use server";

import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/types";

export type RedeemState = {
    error?: string;
    success?: boolean;
    itemTitle?: string;
    price?: string;
    imageUrl?: string | null;
    transactionId?: string | null;
    message?: string;
    intentId?: string; // We pass this back to run the final commit
};

// Step 1: Shop enters code, system returns data for review.
export async function submitRedeemCode(
    _prev: RedeemState,
    formData: FormData
): Promise<RedeemState> {
    let code = (formData.get("code") as string)?.trim();

    if (!code) return { error: "Please enter a 6-character claim code." };
    code = code.toUpperCase();

    const supabase = getSupabase();

    const { data: intent, error: findErr } = await supabase
        .from("intents")
        .select(`
            id,
            status,
            transaction_id,
            items ( title, price_amount, currency, image_url )
        `)
        .eq("claim_code", code)
        .single();

    if (findErr || !intent) return { error: "Invalid claim code. Please check and try again." };
    if (intent.status === "redeemed") return { error: "This code has already been redeemed." };
    if (intent.status !== "paid") return { error: `Payment not yet confirmed. Current status: ${intent.status}` };

    const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;

    return {
        success: true,
        intentId: intent.id,
        itemTitle: (itemData as any)?.title || "Item",
        price: formatPrice((itemData as any)?.price_amount || 0, (itemData as any)?.currency || "ZMK"),
        imageUrl: (itemData as any)?.image_url || null,
        transactionId: intent.transaction_id || "No TID provided",
        message: "Verify TID & Approve",
    };
}

// Step 2: Shop clicks "Hand Over", system commits to DB.
export async function finalizeRedemption(intentId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    const { error } = await supabase
        .from("intents")
        .update({ status: "redeemed" })
        .eq("id", intentId)
        .eq("status", "paid");

    if (error) {
        console.error("[KithLy] Failed to finalize redemption:", error.message);
        return { success: false, error: "System error: Could not complete redemption." };
    }
    return { success: true };
}

// Step 3: Shop sees a fake TID and rejects it.
export async function rejectRedemption(intentId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    
    const { error } = await supabase
        .from("intents")
        .update({ status: "failed" })
        .eq("id", intentId)
        .eq("status", "paid");

    if (error) {
        console.error("[KithLy] Failed to reject redemption:", error.message);
        return { success: false, error: "System error: Could not reject the order." };
    }
    return { success: true };
}

export async function verifyShopPin(pin: string) {
    const supabase = getSupabase();
    const { data: shop, error } = await supabase.from("shops").select("id, name").eq("pin_code", pin).single();
    if (error || !shop) return null;
    return { id: shop.id, name: shop.name };
}

export type ShopDashboardMetrics = {
    revenue: number;
    totalSales: number;
    thisWeekRevenue: number;
    thisWeekSales: number;
    items: { id: string; title: string; price: string; imageUrl: string | null; inStock: boolean; }[];
    pendingOrders: { id: string; claimCode: string; title: string; transactionId: string | null; date: string; }[];
    completedOrders: { id: string; claimCode: string; title: string; transactionId: string | null; date: string; price: number; }[];
};

export async function getShopMetrics(shopId: string): Promise<ShopDashboardMetrics | null> {
    const supabase = getSupabase();

    const { data: items, error: itemsErr } = await supabase
        .from("items")
        .select("id, title, price_amount, currency, image_url, in_stock")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

    if (itemsErr) return null;

    const formattedItems = (items || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: formatPrice(item.price_amount, item.currency || "ZMW"),
        imageUrl: item.image_url,
        inStock: item.in_stock,
    }));

    // We fetch updated_at to know exactly when the item was handed over
    const { data: intents, error: intentsErr } = await supabase
        .from("intents")
        .select(`id, status, claim_code, transaction_id, created_at, items!inner ( id, shop_id, price_amount, title )`)
        .eq("items.shop_id", shopId)
        .in("status", ["paid", "redeemed"])
        .order("created_at", { ascending: false });

    if (intentsErr) return null;

    let revenue = 0;
    let thisWeekRevenue = 0;
    let thisWeekSales = 0;
    const pendingOrders: any[] = [];
    const completedOrders: any[] = [];

    // Calculate the date 7 days ago for our weekly metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    (intents || []).forEach((intent: any) => {
        const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
        const priceAmount = itemData?.price_amount || 0;
        
        const actionDate = new Date(intent.created_at);
        const isRecent = actionDate >= sevenDaysAgo;

        const orderSummary = {
            id: intent.id,
            claimCode: intent.claim_code,
            title: itemData?.title || "Unknown Item",
            transactionId: intent.transaction_id,
            price: priceAmount,
            date: actionDate.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        };

        if (intent.status === "paid") {
            pendingOrders.push(orderSummary);
        }
        if (intent.status === "redeemed") {
            revenue += priceAmount;
            completedOrders.push(orderSummary);
            
            if (isRecent) {
                thisWeekRevenue += priceAmount;
                thisWeekSales += 1;
            }
        }
    });

    return {
        revenue,
        totalSales: completedOrders.length,
        thisWeekRevenue,
        thisWeekSales,
        items: formattedItems,
        pendingOrders,
        completedOrders
    };
}