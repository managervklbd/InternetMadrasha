"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDonor } from "@/lib/actions/donation-actions";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export function AddDonorModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
            committee: formData.get("committee") as string,
            type: formData.get("type") as string,
            fixedAmount: formData.get("fixedAmount") ? Number(formData.get("fixedAmount")) : undefined,
            notes: formData.get("notes") as string,
        };

        const result = await createDonor(data);
        setLoading(false);

        if (result.success) {
            toast.success("Donor added successfully");
            setOpen(false);
        } else {
            toast.error("Failed to add donor");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-bengali bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    দাতা যোগ করুন
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="font-bengali text-xl">নতুন দাতা যোগ করুন</DialogTitle>
                    <p className="text-sm text-zinc-500 font-bengali">দাতা/কমিটি সদস্যের তথ্য পূরণ করুন</p>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="font-bengali">নাম *</Label>
                        <Input id="name" name="name" required placeholder="দাতার নাম" className="font-bengali" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="font-bengali">মোবাইল নম্বর *</Label>
                        <Input id="phone" name="phone" required placeholder="মোবাইল নম্বর" className="font-bengali" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address" className="font-bengali">ঠিকানা</Label>
                        <Input id="address" name="address" placeholder="ঠিকানা" className="font-bengali" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="committee" className="font-bengali">কমিটির নাম</Label>
                        <Input id="committee" name="committee" placeholder="যেমন: ৩১৩ বদরী সা দৃশ্য কমিটি" className="font-bengali" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="font-bengali">দানের ধরন *</Label>
                            <Select name="type" required defaultValue="GENERAL">
                                <SelectTrigger className="font-bengali">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GENERAL" className="font-bengali">সাধারণ</SelectItem>
                                    <SelectItem value="MONTHLY" className="font-bengali">মাসিক</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="fixedAmount" className="font-bengali">নির্ধারিত টাকা *</Label>
                            <Input id="fixedAmount" name="fixedAmount" type="number" placeholder="টাকার পরিমাণ" className="font-bengali" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="font-bengali">নোট</Label>
                        <Input id="notes" name="notes" placeholder="অতিরিক্ত তথ্য" className="font-bengali" />
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
