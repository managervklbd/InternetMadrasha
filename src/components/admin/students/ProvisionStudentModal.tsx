"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import { toast } from "sonner";
import { Loader2, Check, ChevronRight } from "lucide-react";
import { provisionStudent } from "@/lib/actions/student-actions";
import { getAcademicStructure } from "@/lib/actions/academic-actions";
import { getPlans } from "@/lib/actions/billing-actions";
import { countries } from "@/lib/constants/countries";

interface ProvisionStudentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ProvisionStudentModal({ open, onOpenChange, onSuccess }: ProvisionStudentModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data States
    const [courses, setCourses] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);

    // Hierarchy Selection State
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");

    // Form States
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        studentID: "",
        gender: "MALE",
        mode: "OFFLINE",
        residency: "LOCAL",
        country: "",
        whatsappNumber: "",
        departmentId: "",
        batchId: "", // Added
        planId: "",
        admissionDate: new Date(),
    });

    // Derived Hierarchies
    const availableDepartments = courses.find(c => c.id === selectedCourse)?.departments || [];
    const selectedDepartmentData = availableDepartments.find((d: any) => d.id === selectedDepartment);
    const availableBatches = selectedDepartmentData?.batches || [];

    useEffect(() => {
        if (open) {
            setStep(1);
            loadData();
        }
    }, [open]);

    const loadData = async () => {
        const [coursesData, plansData] = await Promise.all([
            getAcademicStructure(),
            getPlans()
        ]);
        setCourses(coursesData);
        setPlans(plansData);
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.fullName || !formData.whatsappNumber) {
                toast.error("অনুগ্রহ করে নাম এবং হোয়াটসঅ্যাপ নম্বর পূরণ করুন");
                return;
            }
        }
        setStep(s => s + 1);
    };
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await provisionStudent({
                ...formData,
                gender: formData.gender as "MALE" | "FEMALE",
                mode: formData.mode as "ONLINE" | "OFFLINE",
                residency: formData.residency as "LOCAL" | "PROBASHI",
            });
            toast.success("ছাত্র অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "ছাত্র যোগ করতে ব্যর্থ হয়েছে");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                <div className="p-6 pb-2">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bengali">নতুন ছাত্র যোগ করুন</DialogTitle>
                        <DialogDescription className="font-bengali">
                            একটি ব্যবহারকারী অ্যাকাউন্ট তৈরি করুন এবং আমন্ত্রণ ইমেল পাঠান।
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex px-6 gap-2 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800 ${step >= i ? 'bg-teal-600' : ''}`} />
                    ))}
                </div>

                <div className="px-6 pb-6 min-h-[300px]">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider font-bengali">ধাপ ১: প্রাথমিক পরিচয়</h3>
                            <div className="grid gap-4 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName" className="font-bengali">পুরো নাম</Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="আব্দুল্লাহ আল-মামুন"
                                        className="font-bengali"
                                        autoFocus
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="font-bengali">ইমেইল ঠিকানা</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="student@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone" className="font-bengali">মোবাইল নম্বর</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="017..."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp" className="font-bengali">হোয়াটসঅ্যাপ নম্বর <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="whatsapp"
                                            value={formData.whatsappNumber}
                                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                            placeholder="+880..."
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="gender" className="font-bengali">লিঙ্গ</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                    >
                                        <SelectTrigger className="font-bengali"><SelectValue /></SelectTrigger>
                                        <SelectContent className="font-bengali">
                                            <SelectItem value="MALE">পুরুষ</SelectItem>
                                            <SelectItem value="FEMALE">মহিলা</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider font-bengali">ধাপ ২: মোড এবং আবাসন</h3>
                            <div className="grid gap-4 py-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="font-bengali">ছাত্রের ধরন</Label>
                                        <Select
                                            value={formData.mode}
                                            onValueChange={(val) => setFormData({ ...formData, mode: val })}
                                        >
                                            <SelectTrigger className="font-bengali"><SelectValue /></SelectTrigger>
                                            <SelectContent className="font-bengali">
                                                <SelectItem value="OFFLINE">অফলাইন (ক্যাম্পাসে)</SelectItem>
                                                <SelectItem value="ONLINE">অনলাইন</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="font-bengali">আবাসিক অবস্থা</Label>
                                        <Select
                                            value={formData.residency}
                                            onValueChange={(val) => setFormData({ ...formData, residency: val })}
                                        >
                                            <SelectTrigger className="font-bengali"><SelectValue /></SelectTrigger>
                                            <SelectContent className="font-bengali">
                                                <SelectItem value="LOCAL">লোকাল (বাংলাদেশ)</SelectItem>
                                                <SelectItem value="PROBASHI">প্রবাসী (আন্তর্জাতিক)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {formData.residency === 'PROBASHI' && (
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 rounded-lg space-y-4 animate-in zoom-in-95 duration-200">
                                        <div className="grid gap-2">
                                            <Label className="font-bengali">দেশ</Label>
                                            <Select
                                                value={formData.country}
                                                onValueChange={(val) => {
                                                    const selected = countries.find(c => c.label === val);
                                                    setFormData({
                                                        ...formData,
                                                        country: val,
                                                        whatsappNumber: selected ? `+${selected.phone} ` : formData.whatsappNumber
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="font-bengali"><SelectValue placeholder="দেশ নির্বাচন করুন" /></SelectTrigger>
                                                <SelectContent className="max-h-[200px]">
                                                    {countries.map((c) => (
                                                        <SelectItem key={c.value} value={c.label}>
                                                            {c.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider font-bengali">ধাপ ৩: একাডেমিক তথ্য</h3>
                            <div className="grid gap-4 py-2">

                                {/* 1. Course (Marhala) Selection */}
                                <div className="grid gap-2">
                                    <Label className="font-bengali">মারহালা / ক্লাস</Label>
                                    <Select
                                        value={selectedCourse}
                                        onValueChange={(val) => {
                                            setSelectedCourse(val);
                                            setSelectedDepartment(""); // Reset dependent fields
                                            setFormData(prev => ({ ...prev, departmentId: "", batchId: "" }));
                                        }}
                                    >
                                        <SelectTrigger className="font-bengali"><SelectValue placeholder="মারহালা নির্বাচন করুন" /></SelectTrigger>
                                        <SelectContent className="font-bengali">
                                            {courses.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 2. Department Selection */}
                                <div className="grid gap-2">
                                    <Label className="font-bengali">বিভাগ</Label>
                                    <Select
                                        value={selectedDepartment}
                                        disabled={!selectedCourse}
                                        onValueChange={(val) => {
                                            setSelectedDepartment(val);
                                            setFormData(prev => ({ ...prev, departmentId: val, batchId: "" }));
                                        }}
                                    >
                                        <SelectTrigger className="font-bengali"><SelectValue placeholder="বিভাগ নির্বাচন করুন" /></SelectTrigger>
                                        <SelectContent className="font-bengali">
                                            {availableDepartments.map((dept: any) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 3. Batch (Semester) Selection */}
                                <div className="grid gap-2">
                                    <Label className="font-bengali">সেমিস্টার / ব্যাচ</Label>
                                    <Select
                                        value={formData.batchId}
                                        disabled={!selectedDepartment}
                                        onValueChange={(val) => {
                                            // Auto-generate Student ID
                                            const currentYear = new Date().getFullYear();
                                            const deptCode = selectedDepartmentData?.code || "DEP";

                                            // Extract Semester Code (e.g., "1st Semester" -> "1S")
                                            const selectedBatch = availableBatches.find((b: any) => b.id === val);
                                            const batchName = selectedBatch?.name || "";
                                            // Take the first character of each word, up to 2 characters, or fallback to '00'
                                            const semCode = batchName.match(/\b\w/g)?.join("").substring(0, 2).toUpperCase() || "00";

                                            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                                            const autoId = `${currentYear}-${deptCode}-${semCode}-${randomSuffix}`;

                                            setFormData(prev => ({
                                                ...prev,
                                                batchId: val,
                                                studentID: autoId
                                            }));
                                        }}
                                    >
                                        <SelectTrigger className="font-bengali"><SelectValue placeholder="সেমিস্টার নির্বাচন করুন" /></SelectTrigger>
                                        <SelectContent className="font-bengali">
                                            {availableBatches
                                                .filter((batch: any) => batch.allowedMode === formData.mode)
                                                .map((batch: any) => (
                                                    <SelectItem key={batch.id} value={batch.id}>
                                                        {batch.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {availableBatches.filter((batch: any) => batch.allowedMode === formData.mode).length === 0 && selectedDepartment && (
                                        <p className="text-xs text-amber-600 font-bengali">
                                            এই বিভাগে নির্বাচিত মোড ({formData.mode === 'ONLINE' ? 'অনলাইন' : 'অফলাইন'}) এর জন্য কোনো ব্যাচ নেই।
                                        </p>
                                    )}
                                </div>

                                {/* Fee Plan Selection */}
                                <div className="grid gap-2">
                                    <Label className="font-bengali">ফী প্ল্যান (অপশনাল)</Label>
                                    <Select
                                        value={formData.planId}
                                        onValueChange={(val) => setFormData({ ...formData, planId: val })}
                                    >
                                        <SelectTrigger className="font-bengali"><SelectValue placeholder="সিলেক্ট করুন (ডিফল্ট: জেনারেল)" /></SelectTrigger>
                                        <SelectContent className="font-bengali">
                                            <SelectItem value="GENERAL">জেনারেল (একাডেমিক স্ট্রাকচার)</SelectItem>
                                            {plans.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} ({p.monthlyFee}৳)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-zinc-500 font-bengali">কোনো প্ল্যান সিলেক্ট না করলে একাডেমিক স্ট্রাকচার অনুযায়ী ফি ধরা হবে।</p>
                                </div>

                                {/* 4. Student ID (Auto-generated) */}
                                <div className="grid gap-2">
                                    <Label className="font-bengali">ছাত্র আইডি (অটোমেটিক)</Label>
                                    <Input
                                        value={formData.studentID}
                                        onChange={(e) => setFormData({ ...formData, studentID: e.target.value })}
                                        className="font-mono font-bold"
                                        placeholder="2024-MZN-..."
                                    />
                                    <p className="text-xs text-zinc-500 font-bengali">অটোমেটিক তৈরি হয়েছে, প্রয়োজনে পরিবর্তন করতে পারেন।</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider font-bengali">ধাপ ৪: নিশ্চিতকরণ</h3>
                            <div className="rounded-lg border bg-zinc-50/50 p-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 font-bengali">নাম</span>
                                    <span className="font-medium font-bengali">{formData.fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 font-bengali">ইমেইল</span>
                                    <span className="font-medium">{formData.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 font-bengali">আইডি</span>
                                    <span className="font-medium">{formData.studentID}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 font-bengali">ফি টিয়ার</span>
                                    <span className="font-medium text-teal-600 font-bengali">
                                        জেনারেল (ডিফল্ট)
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-teal-50 text-teal-900 rounded-lg text-sm flex gap-3 items-start">
                                <Check className="w-5 h-5 shrink-0 text-teal-600 mt-0.5" />
                                <div>
                                    <p className="font-medium font-bengali">আমন্ত্রণের জন্য প্রস্তুত</p>
                                    <p className="text-teal-700/80 mt-1 font-bengali">
                                        <strong>{formData.email}</strong> ঠিকানায় পাসওয়ার্ড সেট করার একটি লিঙ্ক সহ ইমেল পাঠানো হবে।
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={step === 1 ? () => onOpenChange(false) : handleBack}
                        disabled={loading}
                        className="font-bengali"
                    >
                        {step === 1 ? 'বাতিল করুন' : 'পিছনের ধাপ'}
                    </Button>

                    {step < 4 ? (
                        <Button onClick={handleNext} disabled={loading} className="scale-100 hover:scale-105 transition-transform font-bengali">
                            পরবর্তী ধাপ <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-teal-600 hover:bg-teal-700 min-w-[140px] font-bengali"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ছাত্র যোগ করুন'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    );
}
