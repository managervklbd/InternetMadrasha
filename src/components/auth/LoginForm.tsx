"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth-actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        toast({
            title: "অপেক্ষা করুন...",
            description: "আপনার তথ্য যাচাই করা হচ্ছে",
        });

        const formData = new FormData(event.currentTarget);

        try {
            const result = await login(formData);
            if (result) {
                toast({
                    variant: "destructive",
                    title: "লগইন ব্যর্থ হয়েছে",
                    description: "ইমেইল বা পাসওয়ার্ড সঠিক নয়",
                });
            } else {
                toast({
                    title: "সফল!",
                    description: "ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...",
                    className: "bg-green-600 text-white border-none",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "ত্রুটি",
                description: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-[440px] space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-10 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-white/50 dark:border-zinc-800">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-2">স্বাগতম!</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">আপনার অ্যাকাউন্টে লগইন করুন</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">ইমেইল</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="user@internetmadrasha.com"
                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 focus:ring-teal-500 px-6 font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">পাসওয়ার্ড</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 focus:ring-teal-500 px-6 font-medium pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-teal-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {isLoading ? "অপেক্ষা করুন..." : "লগইন করুন"}
                    </Button>

                    <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-2 text-zinc-400 font-medium">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm">নিরাপদ সংযোগ</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
