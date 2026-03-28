"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Store, X } from "lucide-react";

interface Item {
    title: string;
    description: string | null;
    price: string;
    image_url?: string | null;
}

interface ItemCardProps {
    shopName: string;
    item: Item;
    sendHref: string;
}

export function ItemCard({ shopName, item, sendHref }: ItemCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md group">
                <div 
                    onClick={() => setIsOpen(true)}
                    className="cursor-pointer relative flex flex-col pt-0 flex-1"
                >
                    {/* Hover text overlay */}
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full hidden md:block">
                        Click to view details
                    </div>

                    {/* ── 4:3 Image / Fallback ────────────────────── */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shrink-0">
                        {item.image_url ? (
                            <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:opacity-80 transition-opacity">
                                <ImageIcon className="h-8 w-8 opacity-50" />
                                <span className="text-sm font-medium">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* ── Content ─────────────────────────────────── */}
                    <div className="flex flex-col p-5 pb-4 space-y-1 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            <Store className="h-3.5 w-3.5" />
                            <span className="truncate">{shopName}</span>
                        </div>
                        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">
                            {item.title}
                        </h3>
                        <p className="font-semibold text-slate-500 mt-2">{item.price}</p>
                    </div>
                </div>

                {/* ── Action: Direct Send ─────────────────────── */}
                <div className="px-5 pb-5 pt-0 mt-auto">
                    <Link
                        href={sendHref}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient h-11 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                        Send Gift
                    </Link>
                </div>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="overflow-y-auto w-full">
                            <div className="relative w-full aspect-[4/3] bg-slate-100 shrink-0">
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 500px"
                                        priority
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <ImageIcon className="h-10 w-10 opacity-50" />
                                        <span className="text-sm font-medium">No Image</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                        <Store className="h-3.5 w-3.5" />
                                        <span>{shopName}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                        {item.title}
                                    </h2>
                                    <p className="text-xl font-bold text-slate-500 mt-2">{item.price}</p>
                                </div>

                                {item.description && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                            <Link
                                href={sendHref}
                                className="flex w-full items-center justify-center rounded-2xl bg-brand-gradient px-5 h-14 text-base font-semibold text-white shadow-md transition-transform active:scale-[0.98] hover:brightness-110"
                            >
                                Continue to Payment
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
