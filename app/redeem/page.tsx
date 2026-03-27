"use client";

import { useState } from "react";
import { RedeemForm } from "@/components/redeem-form";
import { SenderShell } from "@/components/sender-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RedeemPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // The hardcoded Master PIN for the MVP test
        if (pin === "2026") {
            setIsAuthorized(true);
            setError("");
        } else {
            setError("Invalid Shop PIN");
            setPin("");
        }
    };

    return (
        <SenderShell
            eyebrow="Shop Portal"
            title={isAuthorized ? "Redemption UI" : "Shop Authentication"}
            description={
                isAuthorized
                    ? "The dedicated interface for Shop Owners to verify customer codes and release inventory deterministically."
                    : "Please enter your 4-digit Shop PIN to access the redemption portal."
            }
        >
            <div className="mx-auto max-w-md mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                {!isAuthorized ? (
                    <form onSubmit={handlePinSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="pin" className="text-sm font-medium text-slate-900">
                                Shop PIN
                            </label>
                            <Input
                                id="pin"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                placeholder="••••"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="text-center text-2xl tracking-widest h-14"
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm font-medium text-red-500 text-center">
                                    {error}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-brand-gradient text-white hover:opacity-90 transition-opacity h-12 text-lg"
                        >
                            Unlock Portal
                        </Button>
                    </form>
                ) : (
                    <RedeemForm />
                )}
            </div>
        </SenderShell>
    );
}
