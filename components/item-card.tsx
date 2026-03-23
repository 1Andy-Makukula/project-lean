"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ItemCardProps {
    name: string;
    price: string;
    image_url?: string | null;
    onSendClick?: () => void;
    // Added for Server Component compatibility (like our Home page using Link)
    sendHref?: string;
}

export function ItemCard({ name, price, image_url, onSendClick, sendHref }: ItemCardProps) {
    const buttonContent = (
        <Button
            variant="brand"
            className="w-full"
            onClick={onSendClick}
            disabled={!onSendClick && !sendHref}
        >
            Send
        </Button>
    );

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            {/* 4:3 Image Header */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {image_url ? (
                    <Image
                        src={image_url}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="mb-2 h-8 w-8 opacity-50" />
                        <span className="text-sm font-medium">No Image</span>
                    </div>
                )}
            </div>

            {/* Content & Action */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div className="space-y-1 mb-6">
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">
                        {name}
                    </h3>
                    <p className="font-semibold text-slate-500">{price}</p>
                </div>

                <div>
                    {sendHref ? (
                        <a href={sendHref} className="block w-full">
                            {buttonContent}
                        </a>
                    ) : (
                        buttonContent
                    )}
                </div>
            </div>
        </div>
    );
}
