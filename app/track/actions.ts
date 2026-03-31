"use server";

import { getSupabase } from "@/lib/supabase";

export type TrackResult = {
    id: string;
    title: string;
    date: string;
    status: string;
};

export async function findLostGift(senderName: string, recipientPhone: string): Promise<{ intents?: TrackResult[], error?: string }> {
    if (!senderName || !recipientPhone) {
        return { error: "Please provide both your name and the recipient's phone number." };
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("intents")
        .select(`
            id, 
            status, 
            created_at,
            items ( title )
        `)
        .ilike("sender_name", `%${senderName.trim()}%`) // Case-insensitive search
        .eq("recipient_phone", recipientPhone.trim())
        .order("created_at", { ascending: false })
        .limit(5); // Only bring back the 5 most recent to prevent abuse

    if (error) {
        console.error("[KithLy] Search failed:", error.message);
        return { error: "System error while searching. Please try again." };
    }

    if (!data || data.length === 0) {
        return { error: "No gifts found matching those details. Please check for typos." };
    }

    const formattedIntents = data.map((intent: any) => {
        const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
        return {
            id: intent.id,
            status: intent.status,
            date: intent.created_at,
            title: (itemData as any)?.title || "Gift Item",
        };
    });

    return { intents: formattedIntents };
}
