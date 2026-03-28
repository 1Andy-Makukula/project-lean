"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, Clock, Gift, PartyPopper, ShieldCheck } from "lucide-react";

import { SenderShell } from "@/components/sender-shell";
import { ShareWhatsAppButton } from "@/components/share-whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ── Types ───────────────────────────────────────────────────
export type SenderReceiptDetails = {
    id: string;
    status: string;
    claimCode: string;
    itemTitle: string;
    shopName: string;
    price: string;
    senderName: string;
    recipientPhone: string;
};

type Props = {
    details: SenderReceiptDetails;
    whatsappMessageTemplate: string;
};

// ── Component ───────────────────────────────────────────────
export function RealtimeSenderReceipt({ details, whatsappMessageTemplate }: Props) {
    const [liveStatus, setLiveStatus] = useState(details.status);

    // ── Supabase Realtime subscription ───────────────────────
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(url, key);

        const channel = supabase
            .channel(`sender-receipt-${details.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "intents",
                    filter: `id=eq.${details.id}`,
                },
                (payload) => {
                    const newStatus = payload.new?.status;
                    if (newStatus) {
                        setLiveStatus(newStatus as string);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [details.id]);

    // ── STATE 3: Redeemed — The Climax ─────────────────────
    if (liveStatus === "redeemed") {
        return (
            <SenderShell
                eyebrow="Complete"
                title="Gift Delivered"
                description="The full trust loop is closed. Your gift made it."
            >
                <div className="mx-auto max-w-lg mt-6">
                    <Card className="border-none bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl overflow-hidden relative">
                        <div className="absolute -bottom-8 -right-8 opacity-10">
                            <PartyPopper className="w-48 h-48" />
                        </div>
                        <CardContent className="relative z-10 pt-12 pb-12 flex flex-col items-center gap-6 text-center">
                            <div className="rounded-full bg-white/20 p-5 backdrop-blur-sm">
                                <CheckCircle2 className="h-12 w-12 text-white drop-shadow-md" />
                            </div>
                            <div className="space-y-2 max-w-sm">
                                <h2 className="text-3xl font-black tracking-tight">
                                    Delivered & Enjoyed!
                                </h2>
                                <p className="text-emerald-100 text-sm leading-relaxed">
                                    The shop has successfully handed over{" "}
                                    <span className="font-semibold text-white">{details.itemTitle}</span>{" "}
                                    from <span className="font-semibold text-white">{details.shopName}</span>{" "}
                                    to {details.recipientPhone || "the recipient"}.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-6 py-4 w-full max-w-xs">
                                <p className="text-xs uppercase tracking-wider text-emerald-200 mb-1">Claim Code</p>
                                <p className="text-2xl font-black tracking-widest">{details.claimCode}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <Link href="/" className="block">
                            <Button
                                variant="default"
                                size="lg"
                                className="w-full"
                            >
                                Send another gift
                            </Button>
                        </Link>
                    </div>
                </div>
            </SenderShell>
        );
    }

    // ── STATE 2: Paid — Confirmed ──────────────────────────
    if (liveStatus === "paid") {
        return (
            <SenderShell
                eyebrow="Payment Confirmed"
                title="The recipient can collect now"
                description="Your payment has been verified. The recipient's claim code is now live."
            >
                <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-3">
                                    <ShieldCheck className="h-6 w-6 text-green-700" />
                                </div>
                                <div>
                                    <CardTitle>Payment Confirmed</CardTitle>
                                    <CardDescription>
                                        The recipient can now see their claim code and collect the item
                                        from {details.shopName}.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">Gift active</p>
                                <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                                    {details.itemTitle}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {details.recipientPhone || "The recipient"} can now visit the shop to
                                    collect this item using their secure claim code.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" />
                                    <p className="text-sm leading-6 text-green-800">
                                        This page updates in real time. You&apos;ll see a final confirmation
                                        the moment the shop hands over the item.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-white">Share the redemption link</CardTitle>
                            <CardDescription className="text-slate-300">
                                Send the WhatsApp link so the recipient can collect their item.
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

    // ── STATE 1: Payment Submitted — Waiting ───────────────
    return (
        <SenderShell
            eyebrow="Payment Submitted"
            title="Share the gift"
            description="Your payment is being verified. Share the redemption link with the recipient via WhatsApp."
        >
            <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                <Card className="border-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-slate-100 p-3">
                                <Clock className="h-6 w-6 text-slate-500 animate-pulse" />
                            </div>
                            <div>
                                <CardTitle>Awaiting confirmation</CardTitle>
                                <CardDescription>
                                    The intent is awaiting manual confirmation before the
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
                                    Payment submission is separated from payment confirmation
                                    to prevent false redemption. This page updates automatically.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Share the redemption link</CardTitle>
                        <CardDescription className="text-slate-300">
                            Send the WhatsApp link so the recipient can track readiness
                            and collect their item.
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
