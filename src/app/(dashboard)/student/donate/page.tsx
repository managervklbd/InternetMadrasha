"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Heart } from "lucide-react";
import { initiateDonation } from "@/lib/actions/donation-actions";

export default function StudentDonationPage() {
    const [amount, setAmount] = useState<number | "">("");
    const [purpose, setPurpose] = useState("DONATION");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) < 10) {
            toast.error("সর্বনিম্ন ১০ টাকা দান করতে হবে");
            return;
        }

        setLoading(true);
        try {
            const res = await initiateDonation(Number(amount), purpose, notes);
            if (res.success && res.url) {
                window.location.href = res.url;
            } else {
                toast.error(res.error || "দান প্রক্রিয়া শুরু করতে ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("একটি ত্রুটি হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন");
        } finally {
            setLoading(false);
        }
    };

    const quickAmounts = [100, 500, 1000, 5000];

    return (
        <div className="space-y-6 max-w-2xl mx-auto p-4 md:p-8">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <h1 className="text-3xl font-bold font-bengali">মাদ্রাসায় দান করুন</h1>
                <p className="text-zinc-500 font-bengali">
                    আপনার এই দান দ্বীনি শিক্ষার প্রসারে ব্যবহৃত হবে। <br />
                    আল্লাহ আপনার দান কবুল করুন।
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm">
                <form onSubmit={handleDonate} className="space-y-6">
                    <div className="space-y-3">
                        <Label className="font-bengali text-lg">টাকার পরিমাণ</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">৳</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className="pl-8 h-12 text-lg"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                min={10}
                                required
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {quickAmounts.map((amt) => (
                                <Button
                                    key={amt}
                                    type="button"
                                    variant={amount === amt ? "default" : "outline"}
                                    onClick={() => setAmount(amt)}
                                    className="rounded-full font-bengali"
                                >
                                    {amt} টাকা
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bengali">উদ্দেশ্য (অপশনাল)</Label>
                        <Input
                            placeholder="যেমন: সদকা, যাকাত, সাধারণ দান..."
                            className="font-bengali"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bengali">নোট বা দোয়া (অপশনাল)</Label>
                        <Textarea
                            placeholder="আপনার কোন বিশেষ অনুরোধ বা দোয়া থাকলে লিখুন..."
                            className="font-bengali resize-none"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-bengali bg-rose-600 hover:bg-rose-700 text-white"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                প্রক্রিয়াধীন...
                            </>
                        ) : (
                            "দান করুন"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
