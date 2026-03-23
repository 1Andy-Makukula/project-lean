"use server";

import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export type CreateIntentState = {
    error?: string;
};

export async function createIntent(
    _prev: CreateIntentState,
    formData: FormData
): Promise<CreateIntentState> {
    const itemId = formData.get("itemId") as string;
    const phone = (formData.get("phone") as string)?.trim();
    const message = (formData.get("message") as string)?.trim() || null;

    // ── Validation ──────────────────────────────────────────
    if (!itemId) {
        return { error: "No item selected." };
    }

    if (!phone || phone.length < 6) {
        return { error: "Please enter a valid phone number." };
    }

    // ── Find or create the recipient user by phone ──────────
    const supabase = getSupabase();

    let recipientId: string | null = null;

    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

    if (existingUser) {
        recipientId = existingUser.id;
    } else {
        const { data: newUser, error: userErr } = await supabase
            .from("users")
            .insert({ phone, display_name: phone })
            .select("id")
            .single();

        if (userErr || !newUser) {
            return { error: "Could not register recipient. Please try again." };
        }
        recipientId = newUser.id;
    }

    // ── Create a placeholder sender (MVP — no auth yet) ─────
    // In production this would come from the authenticated session.
    const senderId = await getOrCreateSender(supabase);

    if (!senderId) {
        return { error: "Could not identify sender. Please try again." };
    }

    // ── Insert the intent ───────────────────────────────────
    // claim_code and status default are handled by the DB schema.
    const { data: intent, error: intentErr } = await supabase
        .from("intents")
        .insert({
            sender_id: senderId,
            recipient_id: recipientId,
            item_id: itemId,
            message,
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

// ── Helper: MVP sender ──────────────────────────────────────
// Uses a fixed demo sender until auth is wired up.
async function getOrCreateSender(supabase: ReturnType<typeof getSupabase>): Promise<string | null> {
    const DEMO_PHONE = "+265000000000";

    const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("phone", DEMO_PHONE)
        .single();

    if (existing) return existing.id;

    const { data: created } = await supabase
        .from("users")
        .insert({ phone: DEMO_PHONE, display_name: "KithLy Sender" })
        .select("id")
        .single();

    return created?.id ?? null;
}
