import { notFound } from "next/navigation";

import { getSupabase } from "@/lib/supabase";
import { RealtimeClaimView } from "@/components/realtime-claim-view";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ code: string }>;
};

async function getIntentByCode(code: string) {
    const supabase = getSupabase();

    const { data: intent, error } = await supabase
        .from("intents")
        .select(`
            status,
            claim_code,
            sender_name,
            message,
            items ( title, image_url, shops ( name, location ) )
        `)
        .eq("claim_code", code.toUpperCase())
        .single();

    if (error) {
        console.error("[KithLy] Claim Fetch Error:", error.message);
        return null;
    }
    if (!intent) return null;

    const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
    const shopData = Array.isArray((itemData as any)?.shops) ? (itemData as any)?.shops[0] : (itemData as any)?.shops;

    return {
        status: intent.status,
        claimCode: intent.claim_code,
        senderName: intent.sender_name || "Someone",
        message: intent.message || "Enjoy this gift!",
        itemTitle: (itemData as any)?.title || "Unknown item",
        imageUrl: (itemData as any)?.image_url || null,
        shopName: (shopData as any)?.name || "Unknown shop",
        shopLocation: (shopData as any)?.location || "Unknown location",
    };
}

export default async function ClaimPage({ params }: Props) {
    const { code } = await params;
    if (!code) notFound();

    const details = await getIntentByCode(code);
    if (!details) notFound();

    return <RealtimeClaimView initialDetails={details} />;
}
