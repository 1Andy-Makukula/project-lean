"use server";

import { getSupabase } from "@/lib/supabase";

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
