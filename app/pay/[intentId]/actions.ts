"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

export type SubmitPaymentState = {
    error?: string;
};

export async function submitPayment(
    _prev: SubmitPaymentState,
    formData: FormData
): Promise<SubmitPaymentState> {
    const intentId = formData.get("intentId") as string;

    if (!intentId) {
        return { error: "Intent ID is missing." };
    }

    const supabase = getSupabase();

    // ── Update intent status to payment_submitted ───────────
    const { error } = await supabase
        .from("intents")
        .update({ status: "payment_submitted" })
        .eq("id", intentId)
        .eq("status", "created"); // Only update if currently 'created'

    if (error) {
        console.error("[KithLy] Failed to update intent status:", error.message);
        return { error: "Could not submit payment confirmation. Please try again." };
    }

    // ── Revalidate current dynamic route gracefully ────────
    revalidatePath("/pay/[intentId]", "page");
    return {};
}
