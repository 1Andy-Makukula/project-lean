import Link from "next/link";
import { ArrowRight, Landmark, ShieldCheck } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { SenderShell } from "@/components/sender-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { senderContext } from "@/lib/mock-data";

export default function PayPage() {
  return (
    <SenderShell
      eyebrow="Phase 1 / Screen 3"
      title="Manual payment instructions"
      description="The sender sees one item summary, one pay number, one reference, and one decisive confirmation button. The desktop view turns the instructions into a clean trust panel."
    >
      <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">Pay with Airtel Money</CardTitle>
            <CardDescription className="text-slate-300">
              Transfer the exact amount using the details below, then confirm once submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">Airtel Money number</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-2xl font-bold tracking-tight">{senderContext.airtelMoneyNumber}</p>
                <CopyButton value={senderContext.airtelMoneyNumber} />
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">Reference code</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{senderContext.referenceCode}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5" />
                <p className="text-sm leading-6 text-slate-200">
                  Payment is matched to this intent before the recipient sees the live redemption code.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intent summary</CardTitle>
              <CardDescription>Everything needed to verify the transfer before confirmation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Item</p>
                  <p className="mt-1 font-semibold text-slate-900">{senderContext.item}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Shop</p>
                  <p className="mt-1 font-semibold text-slate-900">{senderContext.shop}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Recipient</p>
                  <p className="mt-1 font-semibold text-slate-900">{senderContext.recipientPhone}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="mt-1 font-semibold text-slate-900">{senderContext.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-900">
                  <Landmark className="h-4 w-4" />
                  <p className="font-semibold">After you pay</p>
                </div>
                <p className="text-sm text-slate-500">
                  KithLy marks this intent as <span className="font-medium text-slate-900">payment_submitted</span> and prepares the WhatsApp share step.
                </p>
              </div>
              <Link href="/confirmation" className="hidden sm:block">
                <Button size="lg" className="gap-2">
                  I Have Paid
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[76px] z-40 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-12px_40px_-24px_rgba(15,23,42,0.22)] lg:hidden">
        <div className="mx-auto max-w-xl">
          <Link href="/confirmation">
            <Button size="lg" className="w-full">
              I Have Paid
            </Button>
          </Link>
        </div>
      </div>
    </SenderShell>
  );
}
