import { notFound } from "next/navigation";

import { SenderShell } from "@/components/sender-shell";
import { SendForm } from "@/components/send-form";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ itemId: string }>;
};

async function getItem(itemId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("items")
        .select("id, title, price_amount, currency, shops ( name )")
        .eq("id", itemId)
        .single();

    if (error || !data) return null;

    return {
        id: data.id as string,
        shop: (data.shops as any)?.name ?? "Unknown shop",
        title: data.title as string,
        price: formatPrice(data.price_amount as number, data.currency as string),
    };
}

export default async function SendItemPage({ params }: Props) {
    const { itemId } = await params;

    if (!itemId) notFound();

    const item = await getItem(itemId);
    if (!item) notFound();

    return (
        <SenderShell
            eyebrow="Send a Gift"
            title={item.title}
            description={`From ${item.shop} · ${item.price}`}
        >
            <SendForm item={item} />
        </SenderShell>
    );
}
