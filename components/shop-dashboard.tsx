"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link2, MessageCircleMore, Package, TrendingUp, ShoppingBag, Loader2, ImageIcon, Clock, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RedeemForm } from "@/components/redeem-form";
import { getShopMetrics, type ShopDashboardMetrics } from "@/app/redeem/actions";
import { formatPrice } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// SHOP DASHBOARD
// ═══════════════════════════════════════════════════════════════

type Props = {
    shopId: string;
    shopName: string;
};

export function ShopDashboard({ shopId, shopName }: Props) {
    const [metrics, setMetrics] = useState<ShopDashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getShopMetrics(shopId).then(data => {
            setMetrics(data);
            setLoading(false);
        });
    }, [shopId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-3 text-sm text-slate-500">Loading shop data…</span>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-red-700">
                Failed to load shop metrics.
            </div>
        );
    }

    const shareMessage = `Hi! Check out the items we have available for gifting or purchase on KithLy.`;
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://kithly.vercel.app";
    const fullShareText = `${shareMessage} ${shareUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;

    return (
        <div className="space-y-8 animate-in mt-6 fade-in duration-500">
            {/* ── Header ───────────────────────────────────── */}
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Welcome back</p>
                <h1 className="text-2xl font-bold text-slate-900">{shopName}</h1>
            </div>

            {/* ── Section 1: Metrics ─────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatPrice(metrics.revenue, "ZMW")}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Items Sold</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-brand-orange" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics.totalSales}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Orders</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics.pendingOrders.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Section 2: Core Engine ─────────────────── */}
            <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                <CardContent className="pt-6">
                    <RedeemForm />
                </CardContent>
            </Card>

            {/* ── Section 3: The Queues ───────────────────── */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Pending Queue */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" /> Pending Orders
                    </h2>
                    {metrics.pendingOrders.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                            No pending orders.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {metrics.pendingOrders.map(order => (
                                <Card key={order.id} className="border-amber-200 bg-amber-50/50">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-900">{order.title}</p>
                                            <p className="text-xs font-mono text-slate-500 mt-1">TID: {order.transactionId}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Queue */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Completed Sales
                    </h2>
                    {metrics.completedOrders.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                            No sales yet.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {metrics.completedOrders.map(order => (
                                <Card key={order.id} className="border-slate-200 opacity-75">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-slate-900 line-through">{order.title}</p>
                                            <p className="text-xs font-mono text-slate-500 mt-1">TID: {order.transactionId}</p>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Section 4: Grow Your Sales ─────────────── */}
            <Card className="bg-slate-900 text-white shadow-xl">
                <CardHeader>
                    <CardTitle className="text-white">Grow Your Sales</CardTitle>
                    <CardDescription className="text-slate-300">
                        Share your shop link with customers on WhatsApp so their friends abroad can buy gifts for them.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-xl bg-white/10 p-4 flex items-center gap-3">
                        <Link2 className="h-5 w-5 text-slate-300 shrink-0" />
                        <p className="text-sm text-slate-200 truncate">{shareUrl}</p>
                    </div>
                    <Button
                        onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white gap-2 font-semibold h-12"
                    >
                        <MessageCircleMore className="h-5 w-5" />
                        Share on WhatsApp
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}