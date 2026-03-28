"use client";

import { useActionState } from "react";
import { LockKeyhole, MessageSquareText, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createIntent, type CreateIntentState } from "@/app/send/actions";

type SendFormProps = {
    item: {
        id: string;
        shop: string;
        title: string;
        price: string;
    };
};

export function SendForm({ item }: SendFormProps) {
    const [state, formAction, isPending] = useActionState<CreateIntentState, FormData>(
        createIntent,
        {}
    );

    return (
        <form action={formAction}>
            <input type="hidden" name="itemId" value={item.id} />

            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                {/* ── Recipient form card ──────────────────── */}
                <Card className="order-2 lg:order-1">
                    <CardHeader>
                        <CardTitle>Recipient details</CardTitle>
                        <CardDescription>
                            Enter the recipient's phone number and an optional message.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-slate-900">
                                Recipient phone number
                            </label>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="+265 9XX XXX XXX"
                                    required
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                This is where the secure gift link will be shared.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-slate-900">
                                Include a message
                            </label>
                            <div className="relative">
                                <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="For the week ahead. Pick it up when it suits you."
                                    className="pl-10 pt-10"
                                />
                            </div>
                        </div>

                        {/* ── Validation error ─────────────── */}
                        {state.error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {state.error}
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <LockKeyhole className="mt-0.5 h-5 w-5 text-slate-900" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">Trust note</p>
                                    <p className="text-sm leading-6 text-slate-500">
                                        KithLy sends an item claim, not money. The recipient only
                                        receives the pickup link after payment is confirmed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Item summary card ─────────────────────── */}
                <Card className="order-1 lg:order-2">
                    <CardHeader>
                        <CardTitle>Selected item</CardTitle>
                        <CardDescription>
                            Review your selection before proceeding to payment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-500">{item.shop}</p>
                            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                {item.title}
                            </p>
                            <p className="mt-3 text-sm text-slate-500">
                                Redeemable in-store with a secure code.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Price</span>
                                <span className="text-lg font-semibold text-slate-900">
                                    {item.price}
                                </span>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <Button
                                type="submit"
                                variant="brand"
                                size="lg"
                                className="w-full"
                                disabled={isPending}
                            >
                                {isPending ? "Creating intent…" : "Continue to Payment"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* ── Mobile sticky CTA ────────────────────────── */}
            <div className="fixed inset-x-0 bottom-[76px] z-40 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-12px_40px_-24px_rgba(15,23,42,0.22)] lg:hidden">
                <div className="mx-auto max-w-xl">
                    <Button
                        type="submit"
                        variant="brand"
                        size="lg"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? "Creating intent…" : "Continue to Payment"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
