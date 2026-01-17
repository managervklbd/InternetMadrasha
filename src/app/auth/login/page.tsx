"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "ACCOUNT_NOT_ACTIVE") {
                    setError("Your account is not activated. Please check your email for the invitation.");
                } else {
                    setError("Invalid email or password.");
                }
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="space-y-1 p-0 pb-8">
                <CardTitle className="text-3xl font-bold tracking-tight">Login</CardTitle>
                <CardDescription className="text-zinc-500 text-lg">
                    Enter your credentials to access your portal.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Button
                                variant="link"
                                className="px-0 font-normal text-zinc-500"
                                type="button"
                            >
                                Forgot password?
                            </Button>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-0 pt-8 border-t border-zinc-100 dark:border-zinc-800 mt-8">
                <div className="text-sm text-center text-zinc-500">
                    No self-registration available. Accounts are managed by administration.
                </div>
            </CardFooter>
        </Card>
    );
}
