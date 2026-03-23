"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitRedeemCode, type RedeemState } from "@/app/redeem/actions";

export function RedeemForm() {
    // We add a key to the form to force a full internal state reset when hitting "Scan Another"
    const [resetKey, setResetKey] = useState(0);

    const [state, formAction, isPending] = useActionState<RedeemState, FormData>(
        submitRedeemCode,
        {}
    );

    const handleReset = () => {
        setResetKey((k) => k + 1);
        // A hacky but effective way to clear the action state is re-mounting the form,
        // but useActionState holds state. We'll track it conditionally instead if needed,
        // or just rely on a completely separate conditional block that hides the form.
    };

    if (state?.success) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center animate-in zoom-in-95 duration-300">
                <div className="rounded-full bg-green-50 p-4">
                    <CheckCircle2 className="h-24 w-24 text-green-500 shadow-sm rounded-full" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {state.message}
                    </h2>
                    <p className="text-lg font-medium text-slate-500">
                        Item: <span className="text-slate-900">{state.itemTitle}</span>
                    </p>
                </div>
                {/* Normally we wouldn't use window.location.reload() for SPA resets, but since useActionState persists indefinitely without a reset method in React 19 currently, a hard refresh or conditional wrapper is safest for the shop terminal MVP! */}
                <Button
                    variant="outline"
                    size="lg"
                    className="mt-8 w-full max-w-sm"
                    onClick={() => window.location.reload()}
                >
                    Redeem Another Code
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
                <Input
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. A1B2C3"
                    className="h-16 text-center text-3xl font-mono uppercase tracking-widest shadow-sm"
                    autoComplete="off"
                    autoFocus
                />

                <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="w-full text-lg h-14"
                    disabled={isPending}
                >
                    {isPending ? "Verifying..." : "Redeem Item"}
                </Button>
            </div>
        </form>
    );
}
