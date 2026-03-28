"use client";

import { useState } from "react";
import { SenderShell } from "@/components/sender-shell";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === "9999") {
            setIsAuthorized(true);
            setError("");
        } else {
            setError("Invalid Master PIN");
            setPin("");
        }
    };

    return (
        <SenderShell
            eyebrow="Admin Portal"
            title={isAuthorized ? "Payment Verification" : "Master PIN Gateway"}
            description={
                isAuthorized
                    ? "Secure dashboard to verify manual Airtel Money transfers and release claim codes to recipients."
                    : "Enter the Master PIN to access the admin control room."
            }
        >
            {!isAuthorized ? (
                <div className="mx-auto max-w-md mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                    <form onSubmit={handlePinSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="admin-pin" className="text-sm font-medium text-slate-900">
                                Master PIN
                            </label>
                            <Input
                                id="admin-pin"
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
                            Access Control Room
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="mt-6">
                    <AdminDashboard />
                </div>
            )}
        </SenderShell>
    );
}
