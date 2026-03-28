"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type AdminIntent = {
    id: string;
    status: string;
    claimCode: string;
    senderPhone: string;
    recipientPhone: string;
    itemTitle: string;
    price: string;
    createdAt: string;
    paymentReference: string | null;
};

export type AdminShop = {
    id: string;
    name: string;
    location: string | null;
    pinCode: string | null;
    createdAt: string;
    itemCount: number;
};

export type AdminItem = {
    id: string;
    shopId: string;
    shopName: string;
    title: string;
    description: string | null;
    priceAmount: number;
    currency: string;
    price: string;
    imageUrl: string | null;
    inStock: boolean;
    createdAt: string;
};

type ActionResult = { success: boolean; error?: string };

// ═══════════════════════════════════════════════════════════════
// INTENTS
// ═══════════════════════════════════════════════════════════════

export async function getAdminIntents(): Promise<AdminIntent[]> {
    const supabase = getSupabase();

    const { data: intents, error } = await supabase
        .from("intents")
        .select(`
            id, status, claim_code, sender_phone, recipient_phone, created_at, payment_reference,
            items ( title, price_amount, currency )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[KithLy Admin] Intents fetch failed:", error.message);
        return [];
    }

    return (intents || []).map((intent: any) => {
        const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
        return {
            id: intent.id,
            status: intent.status,
            claimCode: intent.claim_code,
            senderPhone: intent.sender_phone || "Unknown",
            recipientPhone: intent.recipient_phone || "Unknown",
            itemTitle: (itemData as any)?.title || "Unknown item",
            price: formatPrice((itemData as any)?.price_amount || 0, (itemData as any)?.currency || "MWK"),
            createdAt: intent.created_at,
            paymentReference: intent.payment_reference || null,
        };
    });
}

export async function markIntentPaid(intentId: string): Promise<ActionResult> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from("intents")
        .update({ status: "paid" })
        .eq("id", intentId)
        .eq("status", "payment_submitted");

    if (error) {
        console.error("[KithLy Admin] Failed to mark as paid:", error.message);
        return { success: false, error: "Could not update status." };
    }

    revalidatePath("/admin");
    return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// SHOPS
// ═══════════════════════════════════════════════════════════════

export async function getShops(): Promise<AdminShop[]> {
    const supabase = getSupabase();

    const { data: shops, error } = await supabase
        .from("shops")
        .select("id, name, location, pin_code, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[KithLy Admin] Shops fetch failed:", error.message);
        return [];
    }

    // Get item counts per shop
    const { data: items } = await supabase.from("items").select("shop_id");
    const countMap = new Map<string, number>();
    (items || []).forEach((item: any) => {
        countMap.set(item.shop_id, (countMap.get(item.shop_id) || 0) + 1);
    });

    return (shops || []).map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        location: shop.location,
        pinCode: shop.pin_code,
        createdAt: shop.created_at,
        itemCount: countMap.get(shop.id) || 0,
    }));
}

export async function createShop(name: string, location: string, pinCode: string): Promise<ActionResult> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from("shops")
        .insert({ name, location: location || null, pin_code: pinCode || null });

    if (error) {
        console.error("[KithLy Admin] Shop create failed:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

export async function deleteShop(id: string): Promise<ActionResult> {
    const supabase = getSupabase();

    const { error } = await supabase.from("shops").delete().eq("id", id);

    if (error) {
        console.error("[KithLy Admin] Shop delete failed:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// ITEMS
// ═══════════════════════════════════════════════════════════════

export async function getItems(): Promise<AdminItem[]> {
    const supabase = getSupabase();

    const { data: items, error } = await supabase
        .from("items")
        .select("id, shop_id, title, description, price_amount, currency, image_url, in_stock, created_at, shops ( name )")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[KithLy Admin] Items fetch failed:", error.message);
        return [];
    }

    return (items || []).map((item: any) => {
        const shopData = Array.isArray(item.shops) ? item.shops[0] : item.shops;
        return {
            id: item.id,
            shopId: item.shop_id,
            shopName: (shopData as any)?.name || "Unknown shop",
            title: item.title,
            description: item.description,
            priceAmount: item.price_amount,
            currency: item.currency,
            price: formatPrice(item.price_amount, item.currency),
            imageUrl: item.image_url,
            inStock: item.in_stock,
            createdAt: item.created_at,
        };
    });
}

export async function createItem(
    shopId: string,
    title: string,
    description: string,
    priceAmount: number,
    imageUrl: string
): Promise<ActionResult> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from("items")
        .insert({
            shop_id: shopId,
            title,
            description: description || null,
            price_amount: priceAmount,
            currency: "MWK",
            image_url: imageUrl || null,
            in_stock: true,
        });

    if (error) {
        console.error("[KithLy Admin] Item create failed:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

export async function toggleItemStock(id: string, currentStock: boolean): Promise<ActionResult> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from("items")
        .update({ in_stock: !currentStock })
        .eq("id", id);

    if (error) {
        console.error("[KithLy Admin] Stock toggle failed:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

export async function deleteItem(id: string): Promise<ActionResult> {
    const supabase = getSupabase();

    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) {
        console.error("[KithLy Admin] Item delete failed:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}
