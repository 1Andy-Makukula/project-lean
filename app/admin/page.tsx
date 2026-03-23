import { format } from "date-fns";
import { CheckCircle2, Clock, Landmark, ShieldCheck } from "lucide-react";

import { MarkPaidButton } from "@/components/mark-paid-button";
import { SenderShell } from "@/components/sender-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAdminData() {
    const supabase = getSupabase();

    // 1. Fetch all intents with item details
    const { data: intents, error: intentErr } = await supabase
        .from("intents")
        .select(`
            id,
            status,
            claim_code,
            created_at,
            sender_id,
            recipient_id,
            items ( title, price_amount, currency, shops ( name ) )
        `)
        .order("created_at", { ascending: false });

    if (intentErr) {
        console.error("[KithLy Admin] Fetch failed:", intentErr.message);
        return [];
    }

    // 2. Fetch all users to map phones securely in memory
    const { data: users } = await supabase.from("users").select("id, phone");
    const userMap = new Map((users || []).map(u => [u.id, u.phone]));

    // 3. Transform for view
    return (intents || []).map((intent: any) => ({
        id: intent.id,
        status: intent.status,
        claimCode: intent.claim_code,
        createdAt: new Date(intent.created_at),
        senderPhone: userMap.get(intent.sender_id) || "Unknown",
        recipientPhone: userMap.get(intent.recipient_id) || "Unknown",
        itemTitle: intent.items?.title || "Unknown item",
        shopName: intent.items?.shops?.name || "Unknown shop",
        price: formatPrice(intent.items?.price_amount || 0, intent.items?.currency || "MWK"),
    }));
}

export default async function AdminPage() {
    const intents = await getAdminData();

    return (
        <SenderShell
            eyebrow="Admin Portal"
            title="Payment Verification"
            description="Secure dashboard to verify manual Airtel Money transfers and release claim codes to recipients."
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Intents</CardTitle>
                        <CardDescription>
                            Review payloads and mark as paid once the corresponding Airtel Money transfer is confirmed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="pb-3 pr-4 font-medium">Date (Local)</th>
                                        <th className="pb-3 pr-4 font-medium">Claim Code</th>
                                        <th className="pb-3 pr-4 font-medium">Item & Shop</th>
                                        <th className="pb-3 pr-4 font-medium">Sender</th>
                                        <th className="pb-3 pr-4 font-medium">Amount</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
                                        <th className="pb-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {intents.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-500">
                                                No intents found.
                                            </td>
                                        </tr>
                                    ) : (
                                        intents.map((intent) => (
                                            <tr key={intent.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                <td className="py-4 pr-4 text-slate-500 whitespace-nowrap">
                                                    {format(intent.createdAt, "MMM d, HH:mm")}
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-900">
                                                        {intent.claimCode}
                                                    </code>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <p className="font-medium text-slate-900">{intent.itemTitle}</p>
                                                    <p className="text-xs text-slate-500">{intent.shopName}</p>
                                                </td>
                                                <td className="py-4 pr-4 whitespace-nowrap">
                                                    <p className="text-slate-900">{intent.senderPhone}</p>
                                                    <p className="text-xs text-slate-500">To: {intent.recipientPhone}</p>
                                                </td>
                                                <td className="py-4 pr-4 font-medium text-slate-900 whitespace-nowrap">
                                                    {intent.price}
                                                </td>
                                                <td className="py-4 pr-4 whitespace-nowrap">
                                                    <StatusBadge status={intent.status} />
                                                </td>
                                                <td className="py-4 text-right whitespace-nowrap">
                                                    {intent.status === "payment_submitted" ? (
                                                        <MarkPaidButton intentId={intent.id} />
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SenderShell>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "created":
            return (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    <Clock className="h-3 w-3" />
                    Pending
                </div>
            );
        case "payment_submitted":
            return (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                    <Landmark className="h-3 w-3" />
                    Reviewing Payment
                </div>
            );
        case "paid":
            return (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    <ShieldCheck className="h-3 w-3" />
                    Paid & Active
                </div>
            );
        case "redeemed":
            return (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Redeemed
                </div>
            );
        default:
            return <span className="text-xs text-slate-500">{status}</span>;
    }
}
