"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markIntentPaid } from "@/app/admin/actions";

export function MarkPaidButton({ intentId }: { intentId: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="brand"
            className="h-8 gap-1.5 px-3 text-xs shadow-sm"
            onClick={() => startTransition(async () => { await markIntentPaid(intentId); })}
            disabled={isPending}
        >
            <Check className="h-3.5 w-3.5" />
            {isPending ? "Updating..." : "Mark as Paid"}
        </Button>
    );
}
