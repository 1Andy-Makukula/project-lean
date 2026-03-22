"use client";

import { MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ShareWhatsAppButton({ message }: { message: string }) {
  function handleShare() {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      size="lg"
      className="w-full bg-white text-slate-900 hover:bg-slate-100"
      onClick={handleShare}
    >
      <MessageCircleMore className="mr-2 h-5 w-5" />
      Share via WhatsApp
    </Button>
  );
}
