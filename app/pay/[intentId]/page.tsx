import { notFound } from "next/navigation";

import { SenderShell } from "@/components/sender-shell";
import { PaymentTerminal } from "@/components/payment-terminal";
import { RealtimeSenderReceipt } from "@/components/realtime-sender-receipt";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ intentId: string }>;
};

async function getIntentDetails(intentId: string) {
    const supabase = getSupabase();

    const { data: intent, error } = await supabase
        .from("intents")
        .select(`
            id,
            status,
            claim_code,
            sender_phone,
            recipient_phone,
            items ( title, price_amount, currency, shops ( name ) )
        `)
        .eq("id", intentId)
        .single();

    if (error) {
        console.error("[KithLy] Intent Fetch Error:", error.message);
        return null;
    }
    if (!intent) return null;

    const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
    const shopData = Array.isArray((itemData as any)?.shops) ? (itemData as any)?.shops[0] : (itemData as any)?.shops;

    return {
        id: intent.id,
        status: intent.status,
        claimCode: intent.claim_code,
        itemTitle: (itemData as any)?.title || "Unknown item",
        shopName: (shopData as any)?.name || "Unknown shop",
        price: formatPrice((itemData as any)?.price_amount || 0, (itemData as any)?.currency || "MWK"),
        senderName: intent.sender_phone || "Sender",
        recipientPhone: intent.recipient_phone || "",
    };
}

export default async function PayPage({ params }: Props) {
    const { intentId } = await params;

    if (!intentId) notFound();

    const details = await getIntentDetails(intentId);

    if (!details) notFound();

    // ── State 2: Payment Submitted (or further) ────────────────────────
    if (details.status !== "created") {
        const whatsappMessageTemplate = `Hi! Someone sent you a ${details.itemTitle} from ${details.shopName}. Open your KithLy link to track payment confirmation and collect your code: [CLAIM_URL]`;

        return (
            <RealtimeSenderReceipt
                details={details}
                whatsappMessageTemplate={whatsappMessageTemplate}
            />
        );
    }

    // ── State 1: Awaiting Payment Submission ───────────────────────────
    return (
        <SenderShell
            eyebrow="Payment"
            title="Pay with Airtel Money"
            description={`Transfer ${details.price} to complete your gift of ${details.itemTitle}.`}
        >
            <PaymentTerminal intentId={details.id} details={details} />
        </SenderShell>
    );
}
