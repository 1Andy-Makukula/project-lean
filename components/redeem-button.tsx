"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redeemIntent } from "@/app/claim/[code]/actions";

export function RedeemButton({ claimCode }: { claimCode: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="brand"
            size="lg"
            className="w-full gap-2"
            onClick={() => startTransition(() => redeemIntent(claimCode))}
            disabled={isPending}
        >
            <CheckCircle2 className="h-5 w-5" />
            {isPending ? "Redeeming..." : "Redeem Item"}
        </Button>
    );
}
