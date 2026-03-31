"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, ArrowRight, Gift, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SenderShell } from "@/components/sender-shell";
import { findLostGift, type TrackResult } from "@/app/track/actions";

export default function TrackPage() {
    const [senderName, setSenderName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [results, setResults] = useState<TrackResult[] | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setResults(null);

        const res = await findLostGift(senderName, recipientPhone);
        
        if (res.error) {
            setError(res.error);
        } else if (res.intents) {
            setResults(res.intents);
        }
        
        setIsLoading(false);
    };

    return (
        <SenderShell
            eyebrow="Recovery"
            title="Find Your Gift Link"
            description="Enter the details you used to buy the gift to recover your WhatsApp sharing link."
        >
            <div className="mx-auto max-w-md mt-6 space-y-6">
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Search Details</CardTitle>
                        <CardDescription>We need both fields to securely find your gift.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Your Name (Sender)</label>
                                <Input 
                                    value={senderName} 
                                    onChange={(e) => setSenderName(e.target.value)} 
                                    placeholder="e.g. John Doe" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Recipient Phone</label>
                                <Input 
                                    value={recipientPhone} 
                                    onChange={(e) => setRecipientPhone(e.target.value)} 
                                    placeholder="e.g. 097 XXX XXXX" 
                                    required 
                                />
                            </div>
                            
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                variant="brand" 
                                className="w-full h-12 mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Searching..." : (
                                    <>Search Records <Search className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {results && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Recent Gifts Found</h3>
                        {results.map((intent) => (
                            <Link key={intent.id} href={`/pay/${intent.id}`}>
                                <Card className="border-slate-200 hover:border-brand-orange hover:shadow-md transition-all cursor-pointer group">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 p-2.5 rounded-full group-hover:bg-orange-50 transition-colors">
                                                <Gift className="h-5 w-5 text-slate-600 group-hover:text-brand-orange" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{intent.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {format(new Date(intent.date), "MMM d, yyyy")} • <span className="uppercase">{intent.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-brand-orange transition-colors" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="text-center pt-4">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Storefront
                    </Link>
                </div>
            </div>
        </SenderShell>
    );
}
