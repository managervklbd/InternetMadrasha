"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading("অপেক্ষা করুন...", {
            description: "আপনার তথ্য যাচাই করা হচ্ছে"
        });

        const formData = new FormData(event.currentTarget);

        try {
            const result = await login(formData);
            toast.dismiss(loadingToast);

            if (result && typeof result === 'string') {
                toast.error("লগইন ব্যর্থ হয়েছে", {
                    description: "ইমেইল বা পাসওয়ার্ড সঠিক নয়"
                });
            } else {
                toast.success("সফল!", {
                    description: "ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...",
                });
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("ত্রুটি", {
                description: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-[440px] space-y-8">
            <div className="bg-card dark:bg-card/50 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl shadow-teal-900/10 dark:shadow-none border border-border dark:border-white/5 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors duration-500"></div>

                <div className="mb-10 text-center relative z-10">
                    <h2 className="text-4xl font-black text-foreground mb-3 font-bengali">স্বাগতম!</h2>
                    <p className="text-muted-foreground font-medium">আপনার অ্যাকাউন্টে লগইন করুন</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-bold text-foreground/80 ml-1">ইমেইল</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="user@internetmadrasha.com"
                            className="h-14 rounded-2xl bg-muted/50 focus:bg-background border-border focus:ring-teal-500/50 px-6 font-medium transition-all duration-300"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-bold text-foreground/80 ml-1">পাসওয়ার্ড</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                className="h-14 rounded-2xl bg-muted/50 focus:bg-background border-border focus:ring-teal-500/50 px-6 font-medium pr-12 transition-all duration-300"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <a href="/auth/forgot-password" className="text-sm font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                            পাসওয়ার্ড ভুলে গেছেন?
                        </a>
                    </div>

                    <Button
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {isLoading ? "অপেক্ষা করুন..." : "লগইন করুন"}
                    </Button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-muted-foreground font-bengali">
                            কোনো অ্যাকাউন্ট নেই?{' '}
                            <Link href="/auth/register" className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                নিবন্ধন করুন
                            </Link>
                        </p>
                    </div>

                    <div className="flex items-center justify-center pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <Shield className="w-4 h-4 text-teal-500/50" />
                            <span className="text-sm">নিরাপদ সংযোগ</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
