import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Landmark, ShieldCheck } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { SenderShell } from "@/components/sender-shell";
import { SubmitPaymentForm } from "@/components/submit-payment-form";
import { ShareWhatsAppButton } from "@/components/share-whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { senderContext } from "@/lib/mock-data";
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
            items ( title, price_amount, currency, shops ( name ) ),
            sender:users!intents_sender_id_fkey ( display_name ),
            recipient:users!intents_recipient_id_fkey ( phone )
        `)
        .eq("id", intentId)
        .single();

    if (error || !intent) return null;

    const itemData = Array.isArray(intent.items) ? intent.items[0] : intent.items;
    const shopData = Array.isArray((itemData as any)?.shops) ? (itemData as any)?.shops[0] : (itemData as any)?.shops;
    const senderData = Array.isArray(intent.sender) ? intent.sender[0] : intent.sender;
    const recipientData = Array.isArray(intent.recipient) ? intent.recipient[0] : intent.recipient;

    return {
        id: intent.id,
        status: intent.status,
        claimCode: intent.claim_code,
        itemTitle: (itemData as any)?.title || "Unknown item",
        shopName: (shopData as any)?.name || "Unknown shop",
        price: formatPrice((itemData as any)?.price_amount || 0, (itemData as any)?.currency || "MWK"),
        senderName: (senderData as any)?.display_name || "Someone",
        recipientPhone: (recipientData as any)?.phone || "",
    };
}

export default async function PayPage({ params }: Props) {
    const { intentId } = await params;

    if (!intentId) notFound();

    const details = await getIntentDetails(intentId);

    if (!details) notFound();

    // ── State 2: Payment Submitted (or further) ────────────────────────
    // Showing the consolidated Confirmation success UI dynamically
    if (details.status !== "created") {
        const whatsappMessageTemplate = `Hi! ${details.senderName} sent you a ${details.itemTitle} from ${details.shopName}. Open your KithLy link to track payment confirmation and collect your code: [CLAIM_URL]`;

        return (
            <SenderShell
                eyebrow="Phase 1 / Screen 4"
                title="Confirmation & share"
                description="A calm success state that confirms the intent is now awaiting admin settlement. Sharing via WhatsApp stays visually dominant on both mobile and desktop."
            >
                <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-slate-100 p-3">
                                    <CheckCircle2 className="h-6 w-6 text-slate-900" />
                                </div>
                                <div>
                                    <CardTitle>Status: {details.status}</CardTitle>
                                    <CardDescription>
                                        The intent is created and waiting for manual confirmation before the
                                        recipient sees the secure code.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">Gift ready to share</p>
                                <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                                    {details.itemTitle}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Link goes to {details.recipientPhone || "the recipient"}. The receiver
                                    first sees a waiting state, then the live code after payment approval.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-900" />
                                    <p className="text-sm leading-6 text-slate-500">
                                        This state avoids false redemption by separating payment
                                        submission from payment confirmation.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-white">Share the redemption link</CardTitle>
                            <CardDescription className="text-slate-300">
                                The sender's last step is explicit: share the WhatsApp link and let the
                                recipient track readiness from their side.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-2xl bg-white/10 p-5 text-sm leading-6 text-slate-200 break-words">
                                {whatsappMessageTemplate.replace("[CLAIM_URL]", "https://...")}
                            </div>

                            <ShareWhatsAppButton
                                messageTemplate={whatsappMessageTemplate}
                                claimCode={details.claimCode}
                                recipientPhone={details.recipientPhone}
                            />

                            <Link href="/" className="block">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15"
                                >
                                    Back to item feed
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </section>
            </SenderShell>
        );
    }

    // ── State 1: Awaiting Payment Submission ───────────────────────────
    return (
        <SenderShell
            eyebrow="Phase 1 / Screen 3"
            title="Manual payment instructions"
            description="The sender sees one item summary, one pay number, one reference, and one decisive confirmation button. The desktop view turns the instructions into a clean trust panel."
        >
            <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
                <Card className="bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Pay with Airtel Money</CardTitle>
                        <CardDescription className="text-slate-300">
                            Transfer the exact amount using the details below, then confirm once
                            submitted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl bg-white/10 p-5">
                            <p className="text-sm text-slate-300">Airtel Money number</p>
                            <div className="mt-2 flex items-center justify-between gap-4">
                                <p className="text-2xl font-bold tracking-tight">
                                    {senderContext.airtelMoneyNumber}
                                </p>
                                <CopyButton value={senderContext.airtelMoneyNumber} />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-5">
                            <p className="text-sm text-slate-300">Reference code</p>
                            <p className="mt-2 text-2xl font-bold tracking-tight">
                                {senderContext.referenceCode}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-5">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-1 h-5 w-5" />
                                <p className="text-sm leading-6 text-slate-200">
                                    Payment is matched to this intent before the recipient sees the
                                    live redemption code.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Intent summary</CardTitle>
                            <CardDescription>
                                Everything needed to verify the transfer before confirmation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-sm text-slate-500">Item</p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {details.itemTitle}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-sm text-slate-500">Shop</p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {details.shopName}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-sm text-slate-500">Recipient</p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {details.recipientPhone}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-sm text-slate-500">Amount</p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {details.price}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <Landmark className="h-4 w-4" />
                                    <p className="font-semibold">After you pay</p>
                                </div>
                                <p className="text-sm text-slate-500">
                                    KithLy marks this intent as{" "}
                                    <span className="font-medium text-slate-900">
                                        payment_submitted
                                    </span>{" "}
                                    and prepares the WhatsApp share step.
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <SubmitPaymentForm intentId={details.id} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Mobile Sticky CTA */}
            <div className="fixed inset-x-0 bottom-[76px] z-40 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-12px_40px_-24px_rgba(15,23,42,0.22)] lg:hidden">
                <div className="mx-auto max-w-xl">
                    <SubmitPaymentForm intentId={details.id} isMobile={true} />
                </div>
            </div>
        </SenderShell>
    );
}
