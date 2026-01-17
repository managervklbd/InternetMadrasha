"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { activateAccount } from "@/lib/actions/auth-actions";

import { Suspense } from "react";

function InviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing invitation token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await activateAccount(token, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to activate account.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 pb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Account Activated!</CardTitle>
                    <CardDescription className="text-lg">
                        Your password has been set successfully. You can now login.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Button
                        className="w-full h-12 text-lg"
                        onClick={() => router.push("/auth/login")}
                    >
                        Go to Login
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="space-y-1 p-0 pb-8">
                <CardTitle className="text-3xl font-bold tracking-tight">Set Your Password</CardTitle>
                <CardDescription className="text-zinc-500 text-lg">
                    Please choose a strong password to activate your Madrasa portal account.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            disabled={!token}
                            className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            disabled={!token}
                            className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading || !token}>
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Activate Account"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>}>
            <InviteContent />
        </Suspense>
    );
}
