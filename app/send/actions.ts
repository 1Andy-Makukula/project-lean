"use server";

import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export type CreateIntentState = {
    error?: string;
};

/** Generate a random 6-character uppercase alphanumeric code, e.g. "X7B9Q2" */
function generateClaimCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid ambiguity
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export async function createIntent(
    _prev: CreateIntentState,
    formData: FormData
): Promise<CreateIntentState> {
    const itemId = formData.get("itemId") as string;
    const senderName = (formData.get("senderName") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const message = (formData.get("message") as string)?.trim() || null;

    // ── Validation ──────────────────────────────────────────
    if (!itemId) {
        return { error: "No item selected." };
    }
    
    if (!senderName || senderName.length < 2) {
        return { error: "Please enter your name so the recipient knows who the gift is from." };
    }

    if (!phone || phone.length < 6) {
        return { error: "Please enter a valid recipient phone number." };
    }

    // ── Insert the intent ───────────────────────────────────
    const supabase = getSupabase();
    const claimCode = generateClaimCode();

    const { data: intent, error: intentErr } = await supabase
        .from("intents")
        .insert({
            item_id: itemId,
            sender_name: senderName, // Real Sender Name injected here
            recipient_phone: phone,
            message,
            claim_code: claimCode,
            status: "created",
        })
        .select("id")
        .single();

    if (intentErr || !intent) {
        console.error("[KithLy] Intent insert failed:", intentErr?.message);
        return { error: "Could not create the gift intent. Please try again." };
    }

    // ── Redirect to payment page ────────────────────────────
    redirect(`/pay/${intent.id}`);
}
