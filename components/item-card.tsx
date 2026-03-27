import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

interface ItemCardProps {
    name: string;
    price: string;
    image_url?: string | null;
    sendHref: string;
}

export function ItemCard({ name, price, image_url, sendHref }: ItemCardProps) {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            {/* ── 4:3 Image / Fallback ────────────────────── */}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <ImageIcon className="h-8 w-8 opacity-50" />
                        <span className="text-sm font-medium">No Image</span>
                    </div>
                )}
            </div>

            {/* ── Content ─────────────────────────────────── */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div className="mb-5 space-y-1">
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">
                        {name}
                    </h3>
                    <p className="font-semibold text-slate-500">{price}</p>
                </div>

                {/* ── Action ──────────────────────────────── */}
                <Link
                    href={sendHref}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 h-11 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                    Send
                </Link>
            </div>
        </div>
    );
}
