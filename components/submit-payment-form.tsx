"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitPaymentWithTID } from "@/app/pay/[intentId]/actions";

interface SubmitPaymentFormProps {
    intentId: string;
    isMobile?: boolean;
}

export function SubmitPaymentForm({ intentId, isMobile }: SubmitPaymentFormProps) {
    const [tid, setTid] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tid.trim()) return;

        setIsSubmitting(true);
        try {
            await submitPaymentWithTID(intentId, tid.trim());
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-3 w-full max-w-sm'}`}>
            <div className="flex-1 w-full relative">
                <label htmlFor={`tid-${isMobile ? 'mobile' : 'desktop'}`} className="sr-only">
                    Airtel TID
                </label>
                <Input
                    id={`tid-${isMobile ? 'mobile' : 'desktop'}`}
                    type="text"
                    required
                    placeholder="e.g. PP260328.0911.Q45686"
                    value={tid}
                    onChange={(e) => setTid(e.target.value.toUpperCase())}
                    className="h-12 uppercase font-mono text-sm"
                />
            </div>
            <Button
                type="submit"
                disabled={isSubmitting || !tid.trim()}
                size="lg"
                className={`bg-brand-gradient text-white h-12 ${isMobile ? 'w-full' : ''}`}
            >
                {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <>
                        Verify Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
