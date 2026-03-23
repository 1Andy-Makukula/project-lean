"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

export async function markAsPaid(intentId: string) {
    const supabase = getSupabase();

    // ── Update intent status to 'paid' ──────────────────────
    const { error } = await supabase
        .from("intents")
        .update({ status: "paid" })
        .eq("id", intentId)
        .eq("status", "payment_submitted"); // Safety check

    if (error) {
        console.error("[KithLy Admin] Failed to mark as paid:", error.message);
        throw new Error("Could not update status.");
    }

    // Refresh the admin page data
    revalidatePath("/admin");
}
