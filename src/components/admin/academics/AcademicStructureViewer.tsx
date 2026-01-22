"use client";

import { useState, useEffect } from "react";
import { CourseItem } from "./CourseItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getAcademicStructure, createCourse } from "@/lib/actions/academic-actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getAdminViewMode } from "@/lib/actions/settings-actions";

interface Props {
    initialMode?: "ONLINE" | "OFFLINE";
}

export function AcademicStructureViewer({ initialMode }: Props) {
    const [structure, setStructure] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
    const [newCourseName, setNewCourseName] = useState("");
    const [isSingleCourse, setIsSingleCourse] = useState(false);
    const [creatingCourse, setCreatingCourse] = useState(false);

    const refreshStructure = async () => {
        setLoading(true);
        try {
            // Use initialMode if available, or fetch it (though we expect parent to pass it now)
            // But getAdminViewMode is a server action, calling it here is fine too as a fallback/refresh
            const mode = initialMode || await getAdminViewMode();
            const data = await getAcademicStructure(mode);
            setStructure(data);
        } catch (err) {
            console.error(err);
            toast.error("স্ট্রাকচার লোড করতে ব্যর্থ হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStructure();
    }, [initialMode]);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourseName.trim()) return;

        setCreatingCourse(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const durationMonths = formData.get("durationMonths") ? Number(formData.get("durationMonths")) : undefined;
        const startDate = formData.get("startDate") ? new Date(formData.get("startDate") as string) : undefined;
        const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined;
        const allowedMode = formData.get("allowedMode") as "ONLINE" | "OFFLINE" | undefined;

        const monthlyFee = formData.get("monthlyFee") ? Number(formData.get("monthlyFee")) : undefined;
        const admissionFee = formData.get("admissionFee") ? Number(formData.get("admissionFee")) : undefined;
        const monthlyFeeOffline = formData.get("monthlyFeeOffline") ? Number(formData.get("monthlyFeeOffline")) : undefined;
        const admissionFeeOffline = formData.get("admissionFeeOffline") ? Number(formData.get("admissionFeeOffline")) : undefined;
        const admissionFeeProbashi = formData.get("admissionFeeProbashi") ? Number(formData.get("admissionFeeProbashi")) : undefined;
        const monthlyFeeProbashi = formData.get("monthlyFeeProbashi") ? Number(formData.get("monthlyFeeProbashi")) : undefined;

        try {
            const res = await createCourse({
                name: newCourseName,
                isSingleCourse,
                allowedMode, // Pass the selected mode
                durationMonths,
                startDate,
                endDate,
                monthlyFee,
                admissionFee,
                monthlyFeeOffline,
                admissionFeeOffline,
                admissionFeeProbashi,
                monthlyFeeProbashi
            }) as any;

            if (res.success) {
                toast.success("কোর্স তৈরি সফল হয়েছে");
                setNewCourseName("");
                setIsSingleCourse(false);
                setIsCreateCourseOpen(false);
                refreshStructure();
            } else {
                toast.error(res.error || "কোর্স তৈরি ব্যর্থ");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setCreatingCourse(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    {/* Header is handled in parent page mostly, but we can put controls here */}
                </div>

                <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bengali gap-2 shadow-sm">
                            <Plus className="w-4 h-4" /> নতুন মারহালা/কোর্স
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-bengali">নতুন কোর্স তৈরি করুন</DialogTitle>
                            <DialogDescription className="font-bengali">
                                মাদ্রাসার প্রধান একাডেমিক স্তর (যেমন: হিফজ, কওমি, জেনারেল)।
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bengali">কোর্সের নাম</Label>
                                <Input
                                    className="font-bengali"
                                    placeholder="কোর্সের নাম (যেমন: স্পোকেন ইংলিশ)"
                                    value={newCourseName}
                                    onChange={(e) => setNewCourseName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border">
                                <Label className="font-bengali font-bold text-zinc-700">ফি নির্ধারণ (ঐচ্ছিক)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bengali">ভর্তি ফি (অনলাইন)</Label>
                                        <Input name="admissionFee" type="number" placeholder="0" className="bg-white h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bengali">মাসিক ফি (অনলাইন)</Label>
                                        <Input name="monthlyFee" type="number" placeholder="0" className="bg-white h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bengali">ভর্তি ফি (অফলাইন)</Label>
                                        <Input name="admissionFeeOffline" type="number" placeholder="0" className="bg-white h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bengali">মাসিক ফি (অফলাইন)</Label>
                                        <Input name="monthlyFeeOffline" type="number" placeholder="0" className="bg-white h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bengali text-purple-600">ভর্তি ফি (প্রবাসী $)</Label>
                                        <Input name="admissionFeeProbashi" type="number" placeholder="0" className="bg-white h-8 border-purple-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bengali text-purple-600">মাসিক ফি (প্রবাসী $)</Label>
                                        <Input name="monthlyFeeProbashi" type="number" placeholder="0" className="bg-white h-8 border-purple-200" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 border p-3 rounded-md bg-zinc-50 dark:bg-zinc-900">
                                <Checkbox
                                    id="singleCourse"
                                    checked={isSingleCourse}
                                    onCheckedChange={(c) => setIsSingleCourse(c === true)}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="singleCourse" className="font-bengali cursor-pointer">একক কোর্স (সিঙ্গেল কোর্স)</Label>
                                    <p className="text-xs text-zinc-500 font-bengali">
                                        এটি চেক করলে অটোমেটিক একটি বিভাগ এবং ব্যাচ তৈরি হবে। (যেমন: স্বল্পমেয়াদী কোর্সের জন্য)
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border">
                                <div>
                                    <Label className="font-bengali">কোর্সের মোড নির্ধারণ করুন</Label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-2">
                                            <input type="radio" name="allowedMode" id="mode_offline" value="OFFLINE" defaultChecked />
                                            <Label htmlFor="mode_offline" className="font-bengali cursor-pointer">অফলাইন</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="radio" name="allowedMode" id="mode_online" value="ONLINE" />
                                            <Label htmlFor="mode_online" className="font-bengali cursor-pointer">অনলাইন</Label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 font-bengali mt-1">
                                        নতুন কোর্সের জন্য ডিফল্ট মোড।
                                    </p>
                                </div>

                                {isSingleCourse && (
                                    <p className="text-xs text-teal-600 font-bengali bg-teal-50 p-2 rounded border border-teal-100">
                                        একক কোর্স হিসেবে অটোমেটিক ব্যাচ তৈরি হবে।
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bengali">শুরুর তারিখ</Label>
                                    <Input
                                        type="date"
                                        name="startDate"
                                        className="font-bengali"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bengali">শেষের তারিখ</Label>
                                    <Input
                                        type="date"
                                        name="endDate"
                                        className="font-bengali"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bengali">কোর্সের সময়কাল (মাস)</Label>
                                <Input
                                    type="number"
                                    className="font-bengali"
                                    placeholder="Examples: 12, 6, 4"
                                    name="durationMonths"
                                />
                                <p className="text-xs text-zinc-500 font-bengali">
                                    কোর্সের ডিফল্ট সময়কাল। ফাঁকা রাখলে ১২ মাস ধরা হবে।
                                </p>
                            </div>

                            <DialogFooter>
                                <Button type="submit" className="bg-teal-600 font-bengali w-full" disabled={creatingCourse}>
                                    {creatingCourse ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="text-center py-20 text-zinc-400 font-bengali">লোড হচ্ছে...</div>
                ) : structure.length > 0 ? (
                    structure.map(course => (
                        <CourseItem key={course.id} course={course} onRefresh={refreshStructure} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 font-bengali">কোনো কোর্স পাওয়া যায়নি। উপরের বাটনে ক্লিক করে নতুন কোর্স তৈরি করুন।</p>
                    </div>
                )}
            </div>
        </div >
    );
}
