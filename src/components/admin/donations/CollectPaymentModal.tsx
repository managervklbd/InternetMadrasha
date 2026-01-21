"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDonation } from "@/lib/actions/donation-actions";
import { toast } from "sonner";
import { Loader2, Coins } from "lucide-react";

export function CollectPaymentModal({ donor }: { donor: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Determines default purpose based on donor type, though mainly it's Donation or Subscription
    const defaultAmount = donor.fixedAmount || "";

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            donorName: donor.name,
            phone: donor.phone,
            email: donor.email,
            amount: Number(formData.get("amount")),
            purpose: formData.get("purpose") as any,
            paymentMethod: "CASH" as any,
            transactionId: formData.get("transactionId") as string,
            notes: formData.get("notes") as string,
            date: new Date()
        };

        const result = await createDonation(data);
        setLoading(false);

        if (result.success) {
            toast.success("Payment collected successfully");
            setOpen(false);
        } else {
            toast.error("Failed to collect payment");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-2 text-teal-700 border-teal-200 hover:bg-teal-50 font-bengali">
                    <Coins className="w-3.5 h-3.5" />
                    আদায় করুন
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-bengali">মাসিক পেমেন্ট - {donor.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="donorName" value={donor.name} />
                    <input type="hidden" name="phone" value={donor.phone || ""} />

                    <div className="grid gap-2">
                        <Label className="font-bengali">মাসের নাম / নোট</Label>
                        <Input name="notes" placeholder="যেমন: জানুয়ারি ২০২৬" defaultValue={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} className="font-bengali" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="purpose" className="font-bengali">উদ্দেশ্য</Label>
                        <Select name="purpose" defaultValue="DONATION" required>
                            <SelectTrigger className="font-bengali">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DONATION" className="font-bengali">মাসিক দান</SelectItem>
                                <SelectItem value="LILLAH_BOARDING" className="font-bengali">লিল্লাহ বোর্ডিং</SelectItem>
                                <SelectItem value="CONSTRUCTION" className="font-bengali">নির্মাণ কাজ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="font-bengali">পরিমাণ (টাকা)</Label>
                        <Input id="amount" name="amount" type="number" required defaultValue={defaultAmount} placeholder="০.০০" className="font-bengali" />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-bengali">বাতিল</Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 font-bengali">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            জমা দিন
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
