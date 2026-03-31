"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { CheckCircle2, QrCode, ShieldAlert, ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitRedeemCode, finalizeRedemption, rejectRedemption, type RedeemState } from "@/app/redeem/actions";

export function RedeemForm() {
    const [resetKey, setResetKey] = useState(0);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [finalSuccess, setFinalSuccess] = useState(false);

    const [state, formAction, isPending] = useActionState<RedeemState, FormData>(
        submitRedeemCode,
        {}
    );

    const handleFinalize = async (intentId: string) => {
        setIsFinalizing(true);
        const result = await finalizeRedemption(intentId);
        if (result.success) {
            setFinalSuccess(true);
        } else {
            alert(result.error);
        }
        setIsFinalizing(false);
    };

    const handleReject = async (intentId: string) => {
        if (!confirm("Are you sure? This will cancel the order entirely.")) return;
        setIsRejecting(true);
        const result = await rejectRedemption(intentId);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
            setIsRejecting(false);
        }
    };

    if (finalSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center animate-in zoom-in-95 duration-300">
                <div className="rounded-full bg-green-50 p-4">
                    <CheckCircle2 className="h-24 w-24 text-green-500 shadow-sm rounded-full" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Item Handed Over
                    </h2>
                    <p className="text-lg font-medium text-slate-500">
                        The transaction is complete.
                    </p>
                </div>
                <Button variant="outline" size="lg" className="mt-8 w-full max-w-sm" onClick={() => window.location.reload()}>
                    Redeem Another Code
                </Button>
            </div>
        );
    }

    if (state?.success && state.intentId) {
        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="rounded-2xl border-2 border-brand-orange bg-orange-50/50 p-6 text-center">
                    <ShieldAlert className="mx-auto h-12 w-12 text-brand-orange mb-3" />
                    <h3 className="text-xl font-black text-slate-900 mb-1">Verify Airtel Payment</h3>
                    <p className="text-sm text-slate-700">
                        Check your physical Airtel phone. Did you receive a payment with this exact TID?
                    </p>
                    <div className="mt-4 inline-block bg-white border border-orange-200 rounded-xl px-6 py-3 shadow-sm">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-1">Sender's TID</p>
                        <p className="text-2xl font-mono font-black text-slate-900">{state.transactionId}</p>
                    </div>
                </div>

                <div className="flex gap-4 p-4 border border-slate-200 rounded-2xl bg-white shadow-sm">
                    <div className="relative w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        {state.imageUrl ? (
                            <Image src={state.imageUrl} alt={state.itemTitle || "Item"} fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-slate-300" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="text-xl font-bold text-slate-900">{state.itemTitle}</p>
                        <p className="text-lg font-semibold text-slate-500 mt-1">{state.price}</p>
                    </div>
                </div>

                <Button
                    onClick={() => handleFinalize(state.intentId!)}
                    disabled={isFinalizing}
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white shadow-md font-bold"
                >
                    {isFinalizing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Approve TID & Mark Sold"}
                </Button>

                <Button
                    onClick={() => handleReject(state.intentId!)}
                    disabled={isRejecting}
                    className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white shadow-md font-bold"
                >
                    {isRejecting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reject – Fake TID"}
                </Button>

                <Button variant="ghost" className="w-full text-slate-500" onClick={() => window.location.reload()}>
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <form key={resetKey} action={formAction} className="space-y-6">
            <div className="space-y-2 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-4">
                    <QrCode className="h-6 w-6 text-slate-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Verify claim code
                </h1>
                <p className="text-slate-500">
                    Enter the customer's 6-character secure code.
                </p>
            </div>

            {state?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 animate-in fade-in slide-in-from-top-2">
                    {state.error}
                </div>
            )}

            <div className="space-y-4">
                <Input name="code" type="text" required maxLength={6} placeholder="e.g. A1B2C3" className="h-16 text-center text-3xl font-mono uppercase tracking-widest shadow-sm" autoComplete="off" autoFocus />
                <Button type="submit" variant="brand" size="lg" className="w-full text-lg h-14" disabled={isPending}>
                    {isPending ? "Checking..." : "Review Order"}
                </Button>
            </div>
        </form>
    );
}