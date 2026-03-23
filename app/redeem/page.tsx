import { RedeemForm } from "@/components/redeem-form";
import { SenderShell } from "@/components/sender-shell";

export const dynamic = "force-dynamic";

export default function RedeemPage() {
    return (
        <SenderShell
            eyebrow="Shop Portal"
            title="Redemption UI"
            description="The dedicated interface for Shop Owners to verify customer codes and release inventory deterministically."
        >
            <div className="mx-auto max-w-md mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                <RedeemForm />
            </div>
        </SenderShell>
    );
}
