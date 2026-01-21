"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDonation } from "@/lib/actions/donation-actions";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export function AddDonationModal({ committeeMembers = [] }: { committeeMembers?: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            donorName: formData.get("donorName") as string,
            phone: formData.get("phone") as string,
            email: formData.get("email") as string,
            amount: Number(formData.get("amount")),
            purpose: formData.get("purpose") as any, // Enum
            paymentMethod: "CASH" as any, // Default for now or add select
            transactionId: formData.get("transactionId") as string,
            notes: formData.get("notes") as string,
            collectedById: formData.get("collectedById") as string || undefined,
            date: new Date()
        };

        const result = await createDonation(data);
        setLoading(false);

        if (result.success) {
            toast.success("Donation recorded successfully");
            setOpen(false);
        } else {
            toast.error("Failed to record donation");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-bengali bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    পেমেন্ট যোগ করুন
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-bengali text-xl">নতুন দান রেকর্ড করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="donorName" className="font-bengali">দাতার নাম</Label>
                        <Input id="donorName" name="donorName" required placeholder="দাতার নাম লিখুন" className="font-bengali" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="font-bengali">মোবাইল</Label>
                            <Input id="phone" name="phone" placeholder="ফোন নম্বর" className="font-bengali" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-bengali">ইমেইল</Label>
                            <Input id="email" name="email" placeholder="ইমেইল (ঐচ্ছিক)" className="font-bengali" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="purpose" className="font-bengali">উদ্দেশ্য</Label>
                        <Select name="purpose" required>
                            <SelectTrigger className="font-bengali">
                                <SelectValue placeholder="উদ্দেশ্য নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ZAKAT" className="font-bengali">যাকাত</SelectItem>
                                <SelectItem value="SADAQAH" className="font-bengali">সাদকা</SelectItem>
                                <SelectItem value="NAFL" className="font-bengali">নফল</SelectItem>
                                <SelectItem value="DONATION" className="font-bengali">সাধারণ দান</SelectItem>
                                <SelectItem value="LILLAH_BOARDING" className="font-bengali">লিল্লাহ বোর্ডিং</SelectItem>
                                <SelectItem value="CONSTRUCTION" className="font-bengali">নির্মাণ কাজ</SelectItem>
                                <SelectItem value="OTHER" className="font-bengali">অন্যান্য</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="font-bengali">পরিমাণ (টাকা)</Label>
                        <Input id="amount" name="amount" type="number" required placeholder="০.০০" className="font-bengali" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="transactionId" className="font-bengali">ট্রানজেকশন ID (ঐচ্ছিক)</Label>
                        <Input id="transactionId" name="transactionId" placeholder="রেফারেন্স নম্বর" className="font-bengali" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="font-bengali">নোট</Label>
                        <Input id="notes" name="notes" placeholder="অতিরিক্ত তথ্য" className="font-bengali" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="collectedById" className="font-bengali">সংগ্রহ করেছেন (কমিটি সদস্য)</Label>
                        <Select name="collectedById">
                            <SelectTrigger className="font-bengali">
                                <SelectValue placeholder="সদস্য নির্বাচন করুন (ঐচ্ছিক)" />
                            </SelectTrigger>
                            <SelectContent>
                                {committeeMembers.map((m) => (
                                    <SelectItem key={m.id} value={m.id} className="font-bengali">
                                        {m.name} ({m.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-bengali">বাতিল</Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 font-bengali">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            দান সংরক্ষণ করুন
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
