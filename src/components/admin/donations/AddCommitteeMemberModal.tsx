"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCommitteeMember } from "@/lib/actions/donation-actions";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

export function AddCommitteeMemberModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            email: formData.get("email") as string,
            role: formData.get("role") as string,
        };

        const result = await createCommitteeMember(data);
        setLoading(false);

        if (result.success) {
            toast.success("কমিটি সদস্য সফলভাবে যোগ করা হয়েছে");
            setOpen(false);
        } else {
            toast.error("সদস্য যোগ করতে ব্যর্থ হয়েছে");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-bengali bg-teal-600 hover:bg-teal-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    সদস্য যোগ করুন
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-bengali text-xl">নতুন কমিটি সদস্য যোগ করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="font-bengali">নাম *</Label>
                        <Input id="name" name="name" required placeholder="সদস্যের নাম" className="font-bengali" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="font-bengali">মোবাইল *</Label>
                        <Input id="phone" name="phone" required placeholder="মোবাইল নম্বর" className="font-bengali" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-bengali">ইমেইল</Label>
                        <Input id="email" name="email" placeholder="ইমেইল (ঐচ্ছিক)" className="font-bengali" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role" className="font-bengali">পদবী *</Label>
                        <Input id="role" name="role" required placeholder="যেমন: সভাপতি, সাধারণ সম্পাদক" className="font-bengali" />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-bengali">বাতিল</Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 font-bengali">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            যোগ করুন
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
