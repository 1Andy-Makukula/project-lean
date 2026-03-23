import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Gift, Store } from "lucide-react";

import { RedeemButton } from "@/components/redeem-button";
import { SenderShell } from "@/components/sender-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ code: string }>;
};

async function getClaimDetails(code: string) {
    const supabase = getSupabase();

    const { data: intent, error } = await supabase
        .from("intents")
        .select(`
            id,
            status,
            claim_code,
            message,
            items ( title, shops ( name ) ),
            sender:users!intents_sender_id_fkey ( display_name )
        `)
        .eq("claim_code", code.toUpperCase())
        .single();

    if (error || !intent) return null;

    const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
    const shopData = Array.isArray((itemData as any)?.shops) ? (itemData as any)?.shops[0] : (itemData as any)?.shops;
    const senderData = Array.isArray(intent.sender) ? intent.sender[0] : intent.sender;

    return {
        id: intent.id,
        status: intent.status,
        claimCode: intent.claim_code,
        message: intent.message,
        itemTitle: (itemData as any)?.title || "Unknown item",
        shopName: (shopData as any)?.name || "Unknown shop",
        senderName: (senderData as any)?.display_name || "Someone",
    };
}

export default async function ClaimPage({ params }: Props) {
    const { code } = await params;

    if (!code || code.length !== 6) notFound();

    const details = await getClaimDetails(code);

    if (!details) notFound();

    // ── 1. Pending states (Created / Payment Submitted) ───────
    if (details.status === "created" || details.status === "payment_submitted") {
        return (
            <SenderShell
                eyebrow="Recipient View"
                title="Gift Claim"
                description="Status page for an incoming KithLy gift intent."
            >
                <div className="mx-auto max-w-sm pt-12">
                    <Card className="border-slate-200 text-center shadow-sm">
                        <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
                            <div className="rounded-full bg-slate-100 p-4">
                                <Clock className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 text-lg">
                                    Waiting for payment
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {details.senderName} is completing the payment for your gift.
                                    This page will update once the payment is verified.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SenderShell>
        );
    }

    // ── 2. Redeemed state ─────────────────────────────────────
    if (details.status === "redeemed") {
        return (
            <SenderShell
                eyebrow="Recipient View"
                title="Gift Claim"
                description="This gift has already been claimed."
            >
                <div className="mx-auto max-w-sm pt-12">
                    <Card className="border-slate-200 text-center shadow-sm">
                        <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
                            <div className="rounded-full bg-slate-100 p-4">
                                <CheckCircle2 className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 text-lg">
                                    Already Redeemed
                                </h3>
                                <p className="text-sm text-slate-500">
                                    This gift ({details.itemTitle}) has already been collected from {details.shopName}.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SenderShell>
        );
    }

    // ── 3. Paid (Ready to claim) state ────────────────────────
    return (
        <SenderShell
            eyebrow="Recipient View"
            title="Gift Claim"
            description="Present your claim code at the designated shop to receive your item."
        >
            <div className="mx-auto max-w-md pt-6">
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                    {/* Header with KithLy Orange Gradient */}
                    <div className="bg-brand-gradient px-6 py-10 text-center text-white">
                        <p className="text-sm font-medium uppercase tracking-wider text-white/80 mb-2">
                            Your Claim Code
                        </p>
                        <h1 className="text-5xl font-extrabold tracking-widest drop-shadow-sm">
                            {details.claimCode}
                        </h1>
                    </div>

                    <CardContent className="p-6 space-y-8">
                        {/* Item Details */}
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-slate-500">You received</p>
                            <h2 className="text-2xl font-bold text-slate-900">{details.itemTitle}</h2>
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 pt-1">
                                <Store className="h-4 w-4" />
                                <span className="text-sm">{details.shopName}</span>
                            </div>
                        </div>

                        {/* Sender Message */}
                        {details.message && (
                            <div className="relative rounded-2xl bg-slate-50 px-5 py-4">
                                <Gift className="absolute -left-2 -top-2 h-6 w-6 text-slate-300 drop-shadow-sm rotate-[-10deg]" />
                                <p className="text-sm italic text-slate-700 text-center">
                                    "{details.message}"
                                </p>
                                <p className="text-xs font-semibold text-slate-400 text-center mt-2 uppercase tracking-wide">
                                    — {details.senderName}
                                </p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-3 bg-white">
                            <p className="text-sm text-center text-slate-500">
                                Show this code to the shop owner to collect your item.
                            </p>
                        </div>

                        {/* Shop Owner Action (Simulated) */}
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-400 text-center mb-3 uppercase tracking-wider">
                                Shop Owner Action
                            </p>
                            <RedeemButton claimCode={details.claimCode} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SenderShell>
    );
}
