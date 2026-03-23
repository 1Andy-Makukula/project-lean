import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { SenderShell } from "@/components/sender-shell";
import { ShareWhatsAppButton } from "@/components/share-whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { senderContext } from "@/lib/mock-data";

export default function ConfirmationPage() {
  const whatsappMessage = `Hi ${senderContext.recipientName}, ${senderContext.senderName} sent you a ${senderContext.item} from ${senderContext.shop}. Open your KithLy link to track payment confirmation and collect your code.`;

  return (
    <SenderShell
      eyebrow="Phase 1 / Screen 4"
      title="Confirmation & share"
      description="A calm success state that confirms the intent is now awaiting admin settlement. Sharing via WhatsApp stays visually dominant on both mobile and desktop."
    >
      <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-slate-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <CardTitle>Status: payment_submitted</CardTitle>
                <CardDescription>
                  The intent is created and waiting for manual confirmation before the recipient sees the secure code.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Gift ready to share</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                {senderContext.item}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Link goes to {senderContext.recipientPhone}. The receiver first sees a waiting state, then the live code after payment approval.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-900" />
                <p className="text-sm leading-6 text-slate-500">
                  This state avoids false redemption by separating payment submission from payment confirmation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">Share the redemption link</CardTitle>
            <CardDescription className="text-slate-300">
              The sender's last step is explicit: share the WhatsApp link and let the recipient track readiness from their side.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-5 text-sm leading-6 text-slate-200">
              {whatsappMessage}
            </div>

            <ShareWhatsAppButton message={whatsappMessage} />

            <Link href="/" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                Back to item feed
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </SenderShell>
  );
}
