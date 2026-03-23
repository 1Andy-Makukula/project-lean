"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

export async function redeemIntent(claimCode: string) {
    const supabase = getSupabase();

    // ── Update intent status to 'redeemed' ──────────────────
    const { error } = await supabase
        .from("intents")
        .update({ status: "redeemed" })
        .eq("claim_code", claimCode)
        .eq("status", "paid"); // Safety check: can only redeem if paid

    if (error) {
        console.error("[KithLy Claim] Failed to redeem:", error.message);
        throw new Error("Could not redeem item.");
    }

    // Refresh the claim page
    revalidatePath(`/claim/${claimCode}`);
}
