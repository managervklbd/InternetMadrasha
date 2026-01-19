"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, RefreshCw, Copy, Check } from "lucide-react";
import { adminSetStudentPassword } from "@/lib/actions/student-actions";

export function ManualPasswordReset({ studentId, studentName }: { studentId: string, studentName: string }) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [successCredential, setSuccessCredential] = useState<{ password: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let pass = "";
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
            return;
        }

        setLoading(true);
        try {
            const res = await adminSetStudentPassword(studentId, password);
            if (res.success) {
                toast.success("পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে");
                setSuccessCredential({ password });
            } else {
                toast.error(res.error || "পাসওয়ার্ড আপডেট ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("একটি ত্রুটি হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`Username: ${studentName}\nPassword: ${successCredential?.password}`);
        setCopied(true);
        toast.success("কপি করা হয়েছে");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setOpen(false);
        setPassword("");
        setSuccessCredential(null);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setOpen(true)} className="w-full gap-2 font-bengali bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                    <KeyRound className="w-4 h-4" />
                    পাসওয়ার্ড সেট করুন (Admin)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {!successCredential ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="font-bengali">পাসওয়ার্ড পরিবর্তন করুন</DialogTitle>
                            <DialogDescription className="font-bengali">
                                {studentName}-এর জন্য নতুন পাসওয়ার্ড সেট করুন। এটি ছাত্রের বর্তমান পাসওয়ার্ড প্রতিস্থাপন করবে।
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="password"
                                        type="text"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="e.g. 123456"
                                        className="font-mono"
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generate Password">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading} className="font-bengali bg-teal-600 hover:bg-teal-700 w-full">
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    আপডেট করুন
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <Check className="w-6 h-6 text-green-600" />
                            </div>
                            <DialogTitle className="font-bengali text-center text-green-700">সফলভাবে আপডেট হয়েছে</DialogTitle>
                            <DialogDescription className="font-bengali text-center">
                                দয়া করে নতুন ক্রেডেনশিয়াল সংরক্ষণ করুন।
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="bg-zinc-50 p-4 rounded-lg border space-y-2">
                                <p className="text-sm text-zinc-500 font-medium">Student Name</p>
                                <p className="font-medium font-bengali">{studentName}</p>
                                <div className="h-px bg-zinc-200 my-2" />
                                <p className="text-sm text-zinc-500 font-medium">New Password</p>
                                <p className="font-mono font-bold text-lg tracking-wide">{successCredential.password}</p>
                            </div>
                            <Button onClick={copyToClipboard} variant="outline" className="w-full gap-2">
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                {copied ? "কপি করা হয়েছে" : "কপি করুন"}
                            </Button>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">বন্ধ করুন</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
