"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Clock, Gift, Store, ImageIcon } from "lucide-react";

import { SenderShell } from "@/components/sender-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Types ───────────────────────────────────────────────────
export type ClaimDetails = {
    status: string;
    claimCode: string;
    senderName: string;
    message: string;
    itemTitle: string;
    imageUrl: string | null;
    shopName: string;
    shopLocation: string;
};

type Props = {
    initialDetails: ClaimDetails;
};

// ── Component ───────────────────────────────────────────────
export function RealtimeClaimView({ initialDetails }: Props) {
    const [status, setStatus] = useState(initialDetails.status);
    const details = initialDetails;

    // ── Supabase Realtime subscription ───────────────────────
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(url, key);

        const channel = supabase
            .channel(`claim-${details.claimCode}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "intents",
                    filter: `claim_code=eq.${details.claimCode}`,
                },
                (payload) => {
                    const newStatus = payload.new?.status;
                    if (newStatus) {
                        setStatus(newStatus as string);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [details.claimCode]);

    // ── Waiting state ───────────────────────────────────────
    if (status === "created" || status === "payment_submitted") {
        return (
            <SenderShell
                eyebrow="Recipient Portal"
                title="Incoming Gift"
                description="Your sender is currently finalizing the payment. Please hold tight."
            >
                <Card className="mx-auto max-w-md mt-6 text-center border-slate-200">
                    <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
                        <div className="rounded-full bg-slate-100 p-4">
                            <Clock className="h-8 w-8 text-slate-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Waiting for payment</h2>
                            <p className="mt-2 text-sm text-slate-500 max-w-[250px] mx-auto">
                                We will reveal your secure pickup code the moment the transfer is confirmed.
                                This page updates automatically!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </SenderShell>
        );
    }

    // ── Ready for pickup state ──────────────────────────────
    return (
        <SenderShell
            eyebrow="Recipient Portal"
            title="Ready for pickup"
            description="Show this code at the shop to collect your item."
        >
            <div className="mx-auto max-w-md mt-6 space-y-6">

                {/* ── The Magic Code Block ── */}
                <Card className="border-none bg-brand-gradient text-white shadow-xl overflow-hidden relative animate-in fade-in duration-700">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Gift className="w-32 h-32" />
                    </div>
                    <CardHeader className="relative z-10 pb-2">
                        <CardTitle className="text-white text-center text-sm font-medium tracking-wider uppercase opacity-90">
                            Your Secure Claim Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 text-center pb-8">
                        <p className="text-6xl font-black tracking-[0.2em] ml-4 drop-shadow-md">
                            {details.claimCode}
                        </p>
                    </CardContent>
                </Card>

                {/* ── Item Details ── */}
                <Card className="border-slate-200">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-1/3 aspect-[4/3] sm:aspect-square bg-slate-100">
                            {details.imageUrl ? (
                                <Image
                                    src={details.imageUrl}
                                    alt={details.itemTitle}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-slate-300" />
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-center">
                            <p className="text-sm font-medium text-brand-orange uppercase tracking-wider mb-1">
                                Gift from {details.senderName}
                            </p>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                {details.itemTitle}
                            </h3>
                            {details.message && (
                                <blockquote className="mt-3 border-l-2 border-slate-200 pl-3 text-sm text-slate-500 italic">
                                    &ldquo;{details.message}&rdquo;
                                </blockquote>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Shop Details ── */}
                <Card className="border-slate-200 bg-slate-50">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="rounded-full bg-white p-3 shadow-sm border border-slate-200">
                            <Store className="h-5 w-5 text-slate-700" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">{details.shopName}</p>
                            <p className="text-sm text-slate-500">{details.shopLocation}</p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </SenderShell>
    );
}
