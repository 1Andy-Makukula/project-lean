"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

export async function submitPaymentWithTID(intentId: string, transactionId: string) {
    const supabase = getSupabase();

    const { error } = await supabase
        .from("intents")
        .update({
            status: "payment_submitted",
            transaction_id: transactionId,
        })
        .eq("id", intentId);

    if (error) {
        console.error("[KithLy] Error submitting payment:", error.message);
        throw new Error("Failed to submit payment");
    }

    // Refresh the page so it jumps to State 2 (The WhatsApp Share screen)
    revalidatePath(`/pay/${intentId}`);
}
