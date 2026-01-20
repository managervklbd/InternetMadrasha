"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <div className="text-center bg-red-50 text-red-600 p-4 rounded-lg">
                অবৈধ লিঙ্ক। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("পাসওয়ার্ড মিলছে না");
            return;
        }

        if (password.length < 6) {
            toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(token, password);
            if (res.success) {
                toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে");
                router.push("/auth/login");
            } else {
                toast.error(res.error || "পরিবর্তন ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label className="font-bengali">নতুন পাসওয়ার্ড</Label>
                <Input
                    type="password"
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label className="font-bengali">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                    type="password"
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bengali text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                পাসওয়ার্ড পরিবর্তন করুন
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold font-bengali text-teal-700 dark:text-teal-400">নতুন পাসওয়ার্ড সেট করুন</h1>
                </div>

                <Suspense fallback={<div className="text-center">লোড হচ্ছে...</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <div className="text-center pt-4">
                    <Link href="/auth/login" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-bengali">
                        লগইন এ ফিরে যান
                    </Link>
                </div>
            </div>
        </div>
    );
}
