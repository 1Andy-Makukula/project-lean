"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitPayment, type SubmitPaymentState } from "@/app/pay/[intentId]/actions";

type SubmitPaymentFormProps = {
    intentId: string;
    isMobile?: boolean;
};

export function SubmitPaymentForm({ intentId, isMobile = false }: SubmitPaymentFormProps) {
    const [state, formAction, isPending] = useActionState<SubmitPaymentState, FormData>(
        submitPayment,
        {}
    );

    return (
        <form action={formAction}>
            <input type="hidden" name="intentId" value={intentId} />

            {state.error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {state.error}
                </div>
            )}

            {!isMobile ? (
                // Desktop CTA
                <Button
                    variant="brand"
                    size="lg"
                    className="gap-2"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Submitting..." : "I Have Paid"}
                    {!isPending && <ArrowRight className="h-4 w-4" />}
                </Button>
            ) : (
                // Mobile Sticky CTA
                <Button
                    variant="brand"
                    size="lg"
                    className="w-full"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Submitting..." : "I Have Paid"}
                </Button>
            )}
        </form>
    );
}
