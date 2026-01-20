"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateStudentProfile } from "@/lib/actions/student-actions";
import { toast } from "sonner";

export function EditStudentModal({
    open,
    onOpenChange,
    student,
    isAdmin = false,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: any;
    isAdmin?: boolean;
    onSuccess?: () => void;
}) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            fullName: formData.get("fullName") as string,
            email: student.user.email, // Keep email fixed for non-admins or as per requirement
            phoneNumber: formData.get("phoneNumber") as string,
            whatsappNumber: formData.get("whatsappNumber") as string,
            gender: formData.get("gender") as any,
            mode: formData.get("mode") as any,
            residency: formData.get("residency") as any,
            country: formData.get("country") as string,
            activeStatus: student.activeStatus,
            departmentId: student.departmentId,
            batchId: student.enrollments?.[0]?.batchId,
        };

        // If admin, they might be allowed to change email (but request said disable email input)
        // So we keep email from student object

        try {
            await updateStudentProfile(student.id, data);
            toast.success("প্রোফাইল সফলভাবে আপডেট করা হয়েছে");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || "আপডেট করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] font-bengali">
                <DialogHeader>
                    <DialogTitle>প্রোফাইল আপডেট করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">পূর্ণ নাম</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={student.fullName}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">ফোন নম্বর</Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                defaultValue={student.phoneNumber || ""}
                                placeholder="017XXXXXXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">হোয়াটসঅ্যাপ নম্বর</Label>
                            <Input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                defaultValue={student.whatsappNumber || ""}
                                placeholder="+880..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">দেশ</Label>
                        <Input
                            id="country"
                            name="country"
                            defaultValue={student.country || "Bangladesh"}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">লিঙ্গ</Label>
                            <Select name="gender" defaultValue={student.gender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">পুরুষ</SelectItem>
                                    <SelectItem value="FEMALE">মহিলা</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="residency">আবাসন</Label>
                            <Select name="residency" defaultValue={student.residency}>
                                <SelectTrigger>
                                    <SelectValue placeholder="আবাসন ধরণ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOCAL">দেশি</SelectItem>
                                    <SelectItem value="PROBASHI">প্রবাসী</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mode">শিক্ষাদান পদ্ধতি (Mode)</Label>
                        <Select name="mode" defaultValue={student.mode} disabled={!isAdmin}>
                            <SelectTrigger>
                                <SelectValue placeholder="পদ্ধতি নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ONLINE">অনলাইন</SelectItem>
                                <SelectItem value="OFFLINE">অফলাইন</SelectItem>
                            </SelectContent>
                        </Select>
                        {!isAdmin && (
                            <p className="text-[10px] text-muted-foreground">
                                পদ্ধতি পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            বাতিল
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                            {loading ? "আপডেট হচ্ছে..." : "তথ্য সংরক্ষণ করুন"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
