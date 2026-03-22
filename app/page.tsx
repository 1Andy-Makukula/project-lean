import Link from "next/link";
import { ArrowUpRight, ChevronRight, Store } from "lucide-react";

import { SenderShell } from "@/components/sender-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { featuredItems } from "@/lib/mock-data";

export default function HomePage() {
  const shops = Array.from(new Set(featuredItems.map((item) => item.shop)));

  return (
    <SenderShell
      eyebrow="Phase 1 / Screen 1"
      title="Shop & item feed"
      description="A mobile-first catalog that stays generous on desktop: swipeable shop cards on small screens, then expands into a balanced two-column browsing layout."
    >
      <section className="space-y-8">
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

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle>Available right now</CardTitle>
              <CardDescription>
                The desktop layout shifts navigation left and keeps the item grid wide for quick comparison.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shops.map((shop) => {
                const count = featuredItems.filter((item) => item.shop === shop).length;

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

          <div className="grid gap-6 md:grid-cols-2">
            {featuredItems.map((item) => (
              <Card key={item.id} className="rounded-2xl">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500">{item.shop}</p>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                      {item.price}
                    </div>
                  </div>
                  <CardDescription>{item.eta}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-500">
                    Specific item. Verified redemption.
                  </div>
                  <Link href="/send">
                    <Button className="gap-2">
                      Send
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200 bg-slate-50">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Core action stays obvious</p>
              <p className="text-sm text-slate-500">
                Every card ends in the same decisive CTA so the user never has to interpret the next move.
              </p>
            </div>
            <Link href="/send" className="w-full lg:w-auto">
              <Button size="lg" className="w-full gap-2">
                Start with selected item
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </SenderShell>
  );
}
