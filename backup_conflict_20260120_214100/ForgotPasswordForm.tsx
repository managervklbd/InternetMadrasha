"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await requestPasswordReset(email);
            if (res.success) {
                setSubmitted(true);
            } else {
                toast.error(res.error || "Something went wrong.");
            }
        } catch (error) {
            toast.error("Error sending request.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center space-y-4 animate-in fade-in zoom-in">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-bengali">
                    যদি এই ইমেলের সাথে কোনো অ্যাকাউন্ট থাকে, তবে আমরা একটি রিসেট লিঙ্ক পাঠিয়েছি। অনুগ্রহ করে আপনার ইনবক্স (এবং স্প্যাম ফোল্ডার) চেক করুন।
                </div>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login">লগইন এ ফিরে যান</Link>
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label className="font-bengali">ইমেল</Label>
                <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="font-bengali"
                />
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bengali text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                রিসেট লিঙ্ক পাঠান
            </Button>

            <div className="text-center">
                <Link href="/auth/login" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-bengali">
                    লগইন এ ফিরে যান
                </Link>
            </div>
        </form>
    );
}
