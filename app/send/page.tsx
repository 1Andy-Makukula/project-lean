import Link from "next/link";
import { LockKeyhole, MessageSquareText, Phone } from "lucide-react";

import { SenderShell } from "@/components/sender-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { senderContext } from "@/lib/mock-data";

export default function SendPage() {
  return (
    <SenderShell
      eyebrow="Phase 1 / Screen 2"
      title="Intent creation"
      description="A narrow, high-trust form. The primary mobile action stays sticky and full width, while desktop opens into a summary-plus-form split."
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Recipient details</CardTitle>
            <CardDescription>
              Only the essentials needed to create the intent and prepare the share link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Recipient phone number</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <Input defaultValue={senderContext.recipientPhone} className="pl-10" />
              </div>
              <p className="text-sm text-slate-500">
                This is where the secure gift link will be shared.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Optional message</label>
              <div className="relative">
                <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <Textarea defaultValue={senderContext.message} className="pl-10 pt-10" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-slate-900" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Trust note</p>
                  <p className="text-sm leading-6 text-slate-500">
                    KithLy sends an item claim, not money. The recipient only receives the pickup link after payment is confirmed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Selected item</CardTitle>
            <CardDescription>Clear purchase summary before the sender proceeds to manual payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{senderContext.shop}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {senderContext.item}
              </p>
              <p className="mt-3 text-sm text-slate-500">Redeemable in-store with a secure code.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Price</span>
                <span className="text-lg font-semibold text-slate-900">{senderContext.price}</span>
              </div>
            </div>

            <div className="hidden lg:block">
              <Link href="/pay">
                <Button size="lg" className="w-full">
                  Continue to payment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="fixed inset-x-0 bottom-[76px] z-40 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-12px_40px_-24px_rgba(15,23,42,0.22)] lg:hidden">
        <div className="mx-auto max-w-xl">
          <Link href="/pay">
            <Button size="lg" className="w-full">
              Continue to payment
            </Button>
          </Link>
        </div>
      </div>
    </SenderShell>
  );
}
