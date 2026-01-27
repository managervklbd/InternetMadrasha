"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTeacher } from "@/lib/actions/teacher-actions";
import { useToast } from "@/hooks/use-toast";

export function EditTeacherModal({
    open,
    onOpenChange,
    teacher,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: any;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const { toast } = useToast();

    useEffect(() => {
        if (teacher) {
            setPaymentMethod(teacher.paymentMethod || "CASH");
        }
    }, [teacher]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!teacher) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            fullName: formData.get("fullName") as string,
            designation: formData.get("designation") as string,
            phone: formData.get("phone") as string,
            whatsappNumber: formData.get("whatsappNumber") as string || undefined,
            gender: formData.get("gender") as "MALE" | "FEMALE",
            joiningDate: new Date(formData.get("joiningDate") as string),
            salary: parseFloat(formData.get("salary") as string) || 0,
            paymentMethod: formData.get("paymentMethod") as any,
            bankAccountNumber: formData.get("bankAccountNumber") as string,
            mobileBankingNumber: formData.get("mobileBankingNumber") as string,
        };

        try {
            await updateTeacher(teacher.id, data);
            onSuccess();
            onOpenChange(false);
            toast({
                title: "সফল!",
                description: "শিক্ষকের তথ্য আপডেট করা হয়েছে।",
                className: "bg-teal-600 text-white border-none",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "ব্যর্থ!",
                description: "তথ্য আপডেট করা সম্ভব হয়নি।",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!teacher) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-bengali">
                            তথ্য হালনাগাদ করুন
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-bengali">পূর্ণ নাম (Full Name)</Label>
                            <Input name="fullName" defaultValue={teacher.fullName} required className="font-bengali" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bengali">ইমেইল (Email)</Label>
                            <Input value={teacher.user?.email} disabled className="bg-zinc-100" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bengali">পদবী (Designation)</Label>
                            <Input name="designation" defaultValue={teacher.designation} required className="font-bengali" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bengali">মোবাইল নম্বর</Label>
                            <Input name="phone" defaultValue={teacher.phone} placeholder="017..." required />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bengali">হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)</Label>
                            <Input name="whatsappNumber" defaultValue={teacher.whatsappNumber} placeholder="+8801..." />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bengali">লিঙ্গ (Gender)</Label>
                            <Select name="gender" defaultValue={teacher.gender || "MALE"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">পুরুষ (Male)</SelectItem>
                                    <SelectItem value="FEMALE">মহিলা (Female)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bengali">যোগদানের তারিখ</Label>
                            <Input
                                name="joiningDate"
                                type="date"
                                defaultValue={teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : ''}
                                required
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label className="font-bengali">মাসিক বেতন (Salary)</Label>
                                    <Input name="salary" type="number" defaultValue={teacher.salary} placeholder="0.00" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label className="font-bengali">পেমেন্ট মেথড</Label>
                                    <Select name="paymentMethod" value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">ক্যাশ (Cash)</SelectItem>
                                            <SelectItem value="BANK">ব্যাংক ট্রান্সফার (Bank)</SelectItem>
                                            <SelectItem value="MOBILE_BANKING">মোবাইল ব্যাংকিং (bKash/Nagad)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {paymentMethod === "BANK" && (
                            <div className="space-y-2 col-span-2">
                                <Label className="font-bengali">ব্যাংক অ্যাকাউন্ট নম্বর</Label>
                                <Input name="bankAccountNumber" defaultValue={teacher.bankAccountNumber} placeholder="Account Number, Bank Name, Branch" />
                            </div>
                        )}

                        {paymentMethod === "MOBILE_BANKING" && (
                            <div className="space-y-2 col-span-2">
                                <Label className="font-bengali">মোবাইল ব্যাংকিং নম্বর</Label>
                                <Input name="mobileBankingNumber" defaultValue={teacher.mobileBankingNumber} placeholder="017... (bKash/Nagad/Rocket)" />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-bengali">বাতিল</Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 font-bengali" disabled={loading}>
                            {loading ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
