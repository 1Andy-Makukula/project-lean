"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitPaymentWithTID } from "@/app/pay/[intentId]/actions";

interface PaymentTerminalProps {
    intentId: string;
    details: {
        itemTitle: string;
        shopName: string;
        recipientPhone: string;
        price: string;
    };
}

export function PaymentTerminal({ intentId, details }: PaymentTerminalProps) {
    const [tid, setTid] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasText = tid.trim().length > 0;
    const isValidFormat = tid.toUpperCase().startsWith("TID: ");
    const showValidationError = hasText && !isValidFormat;
    const isDisabled = isSubmitting || !hasText || !isValidFormat;

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (isDisabled) return;

        setIsSubmitting(true);
        try {
            await submitPaymentWithTID(intentId, tid.trim());
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
            {/* LEFT COLUMN: The Data Input Side */}
            <Card className="bg-white border border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-900">Pay with Airtel Money</CardTitle>
                    <CardDescription className="text-slate-500">
                        Transfer the exact amount using the details below, then verify your TID.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                        <p className="text-sm text-slate-600 font-medium">1. Send funds to this number</p>
                        <div className="mt-3 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">097 357 5666</p>
                                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block mt-2">
                                    Registered Name: Raphael Makukula
                                </span>
                            </div>
                            <CopyButton value="0973575666" />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                        <p className="text-sm text-slate-600 font-medium">2. Wait for your Airtel SMS</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            Once you send the money, Airtel will text you a receipt. Look for the <strong className="text-slate-900">TID</strong> number in that message.
                        </p>
                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <p className="font-mono text-xs text-slate-500">Example SMS format:</p>
                            <p className="font-mono text-sm text-slate-800 font-bold mt-1 break-all">
                                TID: PP260328.0911.Q45686
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-1 h-5 w-5 text-brand-orange shrink-0" />
                            <div className="space-y-3 w-full">
                                <p className="text-sm leading-6 text-slate-600">
                                    Copy that exact TID and paste it into the form below so we can verify your transfer immediately.
                                </p>
                                <div className="space-y-2 mt-2">
                                    <Input
                                        type="text"
                                        placeholder="TID: PP260328.0911.Q45686"
                                        value={tid}
                                        onChange={(e) => setTid(e.target.value)}
                                        className={`h-12 bg-white border ${showValidationError ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-brand-orange'} text-slate-900 placeholder:text-slate-400 font-mono text-sm uppercase`}
                                    />
                                    {showValidationError && (
                                        <p className="text-xs font-semibold text-red-500 mt-1.5">
                                            Error: You must include the full TID: prefix exactly as shown in your SMS.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RIGHT COLUMN: The Summary & Action Side */}
            <div className="space-y-6">
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Intent summary</CardTitle>
                        <CardDescription className="text-slate-500">
                            Everything needed to verify the transfer before confirmation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                <p className="text-sm text-slate-500">Item</p>
                                <p className="mt-1 font-semibold text-slate-900">
                                    {details.itemTitle}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                <p className="text-sm text-slate-500">Shop</p>
                                <p className="mt-1 font-semibold text-slate-900">
                                    {details.shopName}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                <p className="text-sm text-slate-500">Recipient</p>
                                <p className="mt-1 font-semibold text-slate-900">
                                    {details.recipientPhone}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                <p className="text-sm text-slate-500">Amount</p>
                                <p className="mt-1 font-semibold text-slate-900">
                                    {details.price}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <Button
                            onClick={handleSubmit}
                            disabled={isDisabled}
                            size="lg"
                            className="w-full bg-brand-gradient text-white h-14 text-base shadow-sm"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Verify Payment
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
