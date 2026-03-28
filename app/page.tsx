import Link from "next/link";
import { ArrowUpRight, ChevronRight, Store } from "lucide-react";

import { ItemCard } from "@/components/item-card";
import { SenderShell } from "@/components/sender-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/types";
import type { FeedItem, DbItem, DbShop } from "@/lib/types";

// ── Force dynamic rendering (fetches live data) ─────────────
export const dynamic = "force-dynamic";

// ── Data fetcher ────────────────────────────────────────────
async function getFeedItems(): Promise<{ shops: string[]; items: FeedItem[] }> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("items")
    .select("id, title, description, price_amount, currency, eta, in_stock, image_url, shops ( name )")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[KithLy] Failed to fetch items:", error.message);
    console.error("[KithLy] Full error:", JSON.stringify(error, null, 2));
    return { shops: [], items: [] };
  }

  const items: FeedItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    shop: row.shops?.name ?? "Unknown shop",
    title: row.title,
    description: row.description ?? null,
    price: formatPrice(row.price_amount, row.currency),
    eta: row.eta ?? "Redeem in-store",
    image_url: row.image_url ?? null,
  }));

  const shops = Array.from(new Set(items.map((i) => i.shop)));

  return { shops, items };
}

// ── Page ────────────────────────────────────────────────────
export default async function HomePage() {
  const { shops, items } = await getFeedItems();

  return (
    <SenderShell
      eyebrow="Welcome"
      title="Send a gift today"
      description="Select an item from a trusted local shop and send it instantly."
    >
      <section className="space-y-8">
        {/* ── Mobile: horizontal scroll of shop cards ──────── */}
        <div className="overflow-x-auto pb-2 lg:hidden">
          <div className="flex snap-x gap-4">
            {shops.map((shop) => (
              <Card
                key={shop}
                className="surface-grid min-w-[260px] snap-center rounded-2xl border-slate-200"
              >
                <CardHeader>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Store className="h-4 w-4" />
                    <span className="text-sm font-medium">Trusted local shop</span>
                  </div>
                  <CardTitle>{shop}</CardTitle>
                  <CardDescription>Specific goods only. No cash transfer ambiguity.</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Desktop sidebar + item grid ─────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle>Available right now</CardTitle>
              <CardDescription>
                Browse trusted local shops and their available items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shops.map((shop) => {
                const count = items.filter((item) => item.shop === shop).length;

                return (
                  <div
                    key={shop}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <p className="font-semibold text-slate-900">{shop}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {count} redeemable item{count > 1 ? "s" : ""}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                shopName={item.shop}
                item={{
                  title: item.title,
                  description: item.description,
                  price: item.price,
                  image_url: item.image_url
                }}
                sendHref={`/send/${item.id}`}
              />
            ))}
          </div>
        </div>

        {/* ── Empty state ────────────────────────────────── */}
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">No items yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Shops will appear here once they publish their first redeemable items.
            </p>
          </div>
        )}
      </section>
    </SenderShell>
  );
}
