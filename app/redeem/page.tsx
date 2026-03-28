"use client";

import { useState } from "react";
import { ShopDashboard } from "@/components/shop-dashboard";
import { SenderShell } from "@/components/sender-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyShopPin } from "@/app/redeem/actions";

export default function RedeemPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [shopId, setShopId] = useState("");
    const [shopName, setShopName] = useState("");
    
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setError("");

        const result = await verifyShopPin(pin);

        if (result) {
            setShopId(result.id);
            setShopName(result.name);
            setIsAuthorized(true);
            setError("");
        } else {
            setError("Invalid Shop PIN");
            setPin("");
        }
        setIsVerifying(false);
    };

    return (
        <SenderShell
            eyebrow="Shop Portal"
            title={isAuthorized ? "Merchant Dashboard" : "Shop Authentication"}
            description={
                isAuthorized
                    ? "Verify customer codes, track your revenue, and manage your active inventory."
                    : "Please enter your 4-digit Shop PIN to access the redemption portal."
            }
        >
            {!isAuthorized ? (
                <div className="mx-auto max-w-md mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
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
                            disabled={isVerifying}
                            className="w-full bg-brand-gradient text-white hover:opacity-90 transition-opacity h-12 text-lg"
                        >
                            {isVerifying ? "Verifying..." : "Unlock Portal"}
                        </Button>
                    </form>
                </div>
            ) : (
                <ShopDashboard shopId={shopId} shopName={shopName} />
            )}
        </SenderShell>
    );
}
