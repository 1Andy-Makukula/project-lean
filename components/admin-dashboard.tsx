"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import {
    CheckCircle2, Clock, ImageIcon, Landmark, Loader2, MapPin,
    Package, Plus, ShieldCheck, Store, ToggleLeft, ToggleRight, Trash2, Upload, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getAdminIntents, markIntentPaid,
    getShops, createShop, deleteShop,
    getItems, createItem, toggleItemStock, deleteItem,
    type AdminIntent, type AdminShop, type AdminItem,
} from "@/app/admin/actions";

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

type Tab = "transactions" | "shops" | "items";

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("transactions");

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "transactions", label: "Transactions", icon: <Landmark className="h-4 w-4" /> },
        { key: "shops", label: "Shops", icon: <Store className="h-4 w-4" /> },
        { key: "items", label: "Items", icon: <Package className="h-4 w-4" /> },
    ];

    return (
        <div className="space-y-6">
            {/* ── Tab Bar ────────────────────────────────── */}
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.key
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ────────────────────────────── */}
            {activeTab === "transactions" && <TransactionsTab />}
            {activeTab === "shops" && <ShopsTab />}
            {activeTab === "items" && <ItemsTab />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTIONS TAB (existing intents view)
// ═══════════════════════════════════════════════════════════════

function TransactionsTab() {
    const [intents, setIntents] = useState<AdminIntent[]>([]);
    const [loading, setLoading] = useState(true);
    const [successId, setSuccessId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getAdminIntents().then(setIntents).finally(() => setLoading(false));
    }, []);

    function handleMarkPaid(intentId: string) {
        startTransition(async () => {
            const result = await markIntentPaid(intentId);
            if (result.success) {
                setIntents((prev) => prev.map((i) => (i.id === intentId ? { ...i, status: "paid" } : i)));
                setSuccessId(intentId);
                setTimeout(() => setSuccessId(null), 2000);
            }
        });
    }

    if (loading) return <LoadingSpinner label="Loading transactions…" />;

    if (intents.length === 0) return <EmptyState text="No transactions yet" sub="Gift intents will appear here once senders start creating them." />;

    return (
        <div className="space-y-4">
            <Card className="hidden lg:block">
                <CardHeader>
                    <CardTitle>All Intents</CardTitle>
                    <CardDescription>Review payloads and mark as paid once the Airtel Money transfer is confirmed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="pb-3 pr-4 font-medium">Date</th>
                                    <th className="pb-3 pr-4 font-medium">Code</th>
                                    <th className="pb-3 pr-4 font-medium">Item</th>
                                    <th className="pb-3 pr-4 font-medium">Sender</th>
                                    <th className="pb-3 pr-4 font-medium">Recipient</th>
                                    <th className="pb-3 pr-4 font-medium">Amount</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {intents.map((intent) => (
                                    <tr key={intent.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 pr-4 text-slate-500 whitespace-nowrap">{format(new Date(intent.createdAt), "MMM d, HH:mm")}</td>
                                        <td className="py-4 pr-4"><code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-900">{intent.claimCode}</code></td>
                                        <td className="py-4 pr-4 font-medium text-slate-900">{intent.itemTitle}</td>
                                        <td className="py-4 pr-4 text-slate-600 whitespace-nowrap">{intent.senderPhone}</td>
                                        <td className="py-4 pr-4 text-slate-600 whitespace-nowrap">{intent.recipientPhone}</td>
                                        <td className="py-4 pr-4 font-medium text-slate-900 whitespace-nowrap">{intent.price}</td>
                                        <td className="py-4 pr-4 whitespace-nowrap"><StatusBadge status={intent.status} /></td>
                                        <td className="py-4 text-right whitespace-nowrap">
                                            <IntentAction intent={intent} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Mobile */}
            <div className="space-y-3 lg:hidden">
                {intents.map((intent) => (
                    <Card key={intent.id} className="border-slate-200">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-900">{intent.claimCode}</code>
                                <StatusBadge status={intent.status} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">{intent.itemTitle}</p>
                                <p className="text-sm text-slate-500">{intent.price}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><p className="text-slate-400 text-xs">Sender</p><p className="text-slate-700">{intent.senderPhone}</p></div>
                                <div><p className="text-slate-400 text-xs">Recipient</p><p className="text-slate-700">{intent.recipientPhone}</p></div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                <p className="text-xs text-slate-400">{format(new Date(intent.createdAt), "MMM d, yyyy · HH:mm")}</p>
                                <IntentAction intent={intent} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// SHOPS TAB
// ═══════════════════════════════════════════════════════════════

function ShopsTab() {
    const [shops, setShops] = useState<AdminShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [airtelNumber, setAirtelNumber] = useState("");
    const [airtelName, setAirtelName] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        getShops().then(setShops).finally(() => setLoading(false));
    }, []);

    function handleCreate() {
        if (!name.trim()) { setFormError("Shop name is required"); return; }
        if (!airtelNumber.trim()) { setFormError("Airtel Number is required for Direct-to-Shop payments"); return; }
        setFormError("");

        startTransition(async () => {
            const result = await createShop(name.trim(), location.trim(), pinCode.trim(), airtelNumber.trim(), airtelName.trim());
            if (result.success) {
                setName(""); setLocation(""); setPinCode(""); setAirtelNumber(""); setAirtelName(""); setShowForm(false);
                getShops().then(setShops);
            } else {
                setFormError(result.error || "Failed to create shop");
            }
        });
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            const result = await deleteShop(id);
            if (result.success) setShops((prev) => prev.filter((s) => s.id !== id));
        });
    }

    if (loading) return <LoadingSpinner label="Loading shops…" />;

    return (
        <div className="space-y-4">
            {/* ── Add button / Form ─────────────────────── */}
            {!showForm ? (
                <Button className="bg-brand-gradient text-white hover:brightness-110 gap-2" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4" /> Add Shop
                </Button>
            ) : (
                <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">New Shop</CardTitle>
                        <button onClick={() => { setShowForm(false); setFormError(""); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Shop Name *</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fresh Market" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Location</label>
                                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lilongwe, Area 47" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">4-Digit PIN</label>
                                <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="e.g. 1234" inputMode="numeric" pattern="[0-9]*" maxLength={4} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Airtel Number *</label>
                                <Input value={airtelNumber} onChange={(e) => setAirtelNumber(e.target.value)} placeholder="e.g. 097 357 5666" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Airtel Name *</label>
                                <Input value={airtelName} onChange={(e) => setAirtelName(e.target.value)} placeholder="e.g. Fresh Market Ltd" />
                            </div>
                        </div>
                        {formError && <p className="text-sm text-red-500">{formError}</p>}
                        <Button className="bg-brand-gradient text-white hover:brightness-110" onClick={handleCreate} disabled={isPending}>
                            {isPending ? "Creating…" : "Create Shop"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Shop list ────────────────────────────── */}
            {shops.length === 0 ? (
                <EmptyState text="No shops yet" sub="Add your first shop to start listing items." />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {shops.map((shop) => (
                        <Card key={shop.id} className="border-slate-200 group">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-slate-100 p-2.5">
                                            <Store className="h-4 w-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{shop.name}</p>
                                            {shop.location && (
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3" /> {shop.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(shop.id)}
                                        disabled={isPending}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                                    <span className="text-slate-500">{shop.itemCount} item{shop.itemCount !== 1 ? "s" : ""}</span>
                                    {shop.pinCode && (
                                        <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                            PIN: {shop.pinCode}
                                        </code>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ITEMS TAB
// ═══════════════════════════════════════════════════════════════

function ItemsTab() {
    const [items, setItems] = useState<AdminItem[]>([]);
    const [shops, setShops] = useState<AdminShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [shopId, setShopId] = useState("");
    const [formError, setFormError] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        Promise.all([getItems(), getShops()])
            .then(([i, s]) => { setItems(i); setShops(s); })
            .finally(() => setLoading(false));
    }, []);

    async function handleCreate() {
        if (!title.trim()) { setFormError("Title is required"); return; }
        if (!price || Number(price) <= 0) { setFormError("Enter a valid price"); return; }
        if (!shopId) { setFormError("Select a shop"); return; }
        setFormError("");

        let finalImageUrl = "";

        // ── Upload image to Supabase Storage if selected ────
        if (imageFile) {
            setUploading(true);
            try {
                const ext = imageFile.name.split(".").pop() || "jpg";
                const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { error: uploadErr } = await supabase.storage
                    .from("item-images")
                    .upload(uniqueName, imageFile);

                if (uploadErr) {
                    setFormError(`Upload failed: ${uploadErr.message}`);
                    setUploading(false);
                    return;
                }

                const { data: urlData } = supabase.storage
                    .from("item-images")
                    .getPublicUrl(uniqueName);

                finalImageUrl = urlData.publicUrl;
            } catch {
                setFormError("Image upload failed. Please try again.");
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        startTransition(async () => {
            const result = await createItem(shopId, title.trim(), description.trim(), Number(price), finalImageUrl);
            if (result.success) {
                setTitle(""); setDescription(""); setPrice(""); setImageFile(null); setShopId(""); setShowForm(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
                getItems().then(setItems);
            } else {
                setFormError(result.error || "Failed to create item");
            }
        });
    }

    function handleToggleStock(id: string, current: boolean) {
        startTransition(async () => {
            const result = await toggleItemStock(id, current);
            if (result.success) {
                setItems((prev) => prev.map((i) => (i.id === id ? { ...i, inStock: !current } : i)));
            }
        });
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            const result = await deleteItem(id);
            if (result.success) setItems((prev) => prev.filter((i) => i.id !== id));
        });
    }

    if (loading) return <LoadingSpinner label="Loading items…" />;

    return (
        <div className="space-y-4">
            {/* ── Add button / Form ─────────────────────── */}
            {!showForm ? (
                <Button className="bg-brand-gradient text-white hover:brightness-110 gap-2" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4" /> Add Item
                </Button>
            ) : (
                <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">New Item</CardTitle>
                        <button onClick={() => { setShowForm(false); setFormError(""); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Title *</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Groceries Bundle" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-medium text-slate-500">Combo Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Includes: 1x Nshima, 1x Fanta, Extra Meat"
                                    className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 min-h-[80px] resize-y"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Price (ZMW) *</label>
                                <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 18000" type="number" inputMode="numeric" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Item Image</label>
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                                    />
                                </div>
                                {imageFile && (
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <Upload className="h-3 w-3" />
                                        {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Shop *</label>
                                <select
                                    value={shopId}
                                    onChange={(e) => setShopId(e.target.value)}
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                                >
                                    <option value="">Select a shop…</option>
                                    {shops.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {formError && <p className="text-sm text-red-500">{formError}</p>}
                        <Button className="bg-brand-gradient text-white hover:brightness-110" onClick={handleCreate} disabled={isPending || uploading}>
                            {uploading ? "Uploading image…" : isPending ? "Creating…" : "Create Item"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Items list ───────────────────────────── */}
            {items.length === 0 ? (
                <EmptyState text="No items yet" sub="Add your first item to start accepting gifts." />
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <Card key={item.id} className="border-slate-200 group">
                            <CardContent className="p-0 flex items-stretch">
                                {/* Thumbnail */}
                                <div className="relative w-20 min-h-[5rem] shrink-0 bg-slate-100 rounded-l-xl overflow-hidden">
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="80px" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ImageIcon className="h-5 w-5 text-slate-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 p-4 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-sm">
                                            <span className="text-slate-500">{item.price}</span>
                                            <span className="text-slate-300">·</span>
                                            <span className="text-slate-500 truncate">{item.shopName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Stock toggle */}
                                        <button
                                            onClick={() => handleToggleStock(item.id, item.inStock)}
                                            disabled={isPending}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${item.inStock
                                                    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                                                }`}
                                        >
                                            {item.inStock ? (
                                                <><ToggleRight className="h-3.5 w-3.5" /> In Stock</>
                                            ) : (
                                                <><ToggleLeft className="h-3.5 w-3.5" /> Out</>
                                            )}
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={isPending}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function LoadingSpinner({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-3 text-sm text-slate-500">{label}</span>
        </div>
    );
}

function EmptyState({ text, sub }: { text: string; sub: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">{text}</p>
            <p className="mt-1 text-sm text-slate-500">{sub}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "created":
            return <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600"><Clock className="h-3 w-3" />Pending</div>;
        case "payment_submitted":
            return <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700"><Landmark className="h-3 w-3" />Reviewing</div>;
        case "paid":
            return <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700"><ShieldCheck className="h-3 w-3" />Paid</div>;
        case "redeemed":
            return <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500"><CheckCircle2 className="h-3 w-3" />Redeemed</div>;
        default:
            return <span className="text-xs text-slate-500">{status}</span>;
    }
}

function IntentAction({ intent }: { intent: AdminIntent }) {
    if (intent.status === "redeemed") {
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><CheckCircle2 className="h-3.5 w-3.5" />Handed Over</span>;
    }
    if (intent.status === "paid") {
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500"><Clock className="h-3.5 w-3.5" />Pending Pickup</span>;
    }
    return <span className="text-xs text-slate-400">—</span>;
}
