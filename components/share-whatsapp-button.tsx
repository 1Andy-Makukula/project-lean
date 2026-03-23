"use client";

import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareWhatsAppButtonProps = {
  messageTemplate: string;
  claimCode: string;
  recipientPhone?: string;
};

export function ShareWhatsAppButton({
  messageTemplate,
  claimCode,
  recipientPhone
}: ShareWhatsAppButtonProps) {
  function handleShare() {
    // Construct the full absolute claim URL based on the current domain
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const claimUrl = `${origin}/claim/${claimCode}`;

    // Replace the placeholder tag with the real URL
    const message = messageTemplate.replace("[CLAIM_URL]", claimUrl);

    // Strip non-numeric characters from the phone number for WhatsApp's API
    const phoneParam = recipientPhone ? recipientPhone.replace(/\D/g, "") : "";

    // Format: https://wa.me/<number>/?text=<url-encoded-text>
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      variant="brand"
      size="lg"
      className="w-full gap-2"
      onClick={handleShare}
    >
      <MessageCircleMore className="h-5 w-5" />
      Share via WhatsApp
    </Button>
  );
}
