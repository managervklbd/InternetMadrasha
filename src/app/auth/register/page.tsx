"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Check, ChevronRight, User, Globe, BookOpen, CreditCard } from "lucide-react";
import { getAcademicStructure } from "@/lib/actions/academic-actions";
import { registerStudentAndPay } from "@/lib/actions/register-actions";
import { countries } from "@/lib/constants/countries";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data States
    const [courses, setCourses] = useState<any[]>([]);

    // Hierarchy Selection State
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");

    // Form States
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        studentID: "",
        gender: "MALE",
        mode: "OFFLINE",
        residency: "LOCAL",
        country: "",
        whatsappNumber: "",
        departmentId: "",
        batchId: "",
    });

    // Derived Data
    const availableDepartments = courses.find(c => c.id === selectedCourse)?.departments || [];
    const selectedDepartmentData = availableDepartments.find((d: any) => d.id === selectedDepartment);
    const availableBatches = selectedDepartmentData?.batches || [];
    const selectedBatchData = availableBatches.find((b: any) => b.id === formData.batchId);

    // Fee Calculation
    const getFeeDetails = () => {
        if (!selectedBatchData) return { admissionFee: 0, monthlyFee: 0 };

        let admissionFee = 0;
        let monthlyFee = 0;
        const batch = selectedBatchData;
        const dept = selectedDepartmentData;
        const course = courses.find(c => c.id === selectedCourse);

        if (formData.residency === "PROBASHI") {
            admissionFee = batch.admissionFeeProbashi ?? dept?.admissionFeeProbashi ?? course?.admissionFeeProbashi ??
                batch.admissionFee ?? dept?.admissionFee ?? course?.admissionFee ?? 0;

            monthlyFee = batch.monthlyFeeProbashi ?? dept?.monthlyFeeProbashi ?? course?.monthlyFeeProbashi ??
                batch.monthlyFee ?? dept?.monthlyFee ?? course?.monthlyFee ?? 0;
        } else {
            if (formData.mode === "OFFLINE") {
                admissionFee = batch.admissionFeeOffline ?? dept?.admissionFeeOffline ?? course?.admissionFeeOffline ??
                    batch.admissionFee ?? dept?.admissionFee ?? course?.admissionFee ?? 0;

                monthlyFee = batch.monthlyFeeOffline ?? dept?.monthlyFeeOffline ?? course?.monthlyFeeOffline ??
                    batch.monthlyFee ?? dept?.monthlyFee ?? course?.monthlyFee ?? 0;
            } else {
                admissionFee = batch.admissionFee ?? dept?.admissionFee ?? course?.admissionFee ?? 0;
                monthlyFee = batch.monthlyFee ?? dept?.monthlyFee ?? course?.monthlyFee ?? 0;
            }
        }
        return { admissionFee, monthlyFee };
    };

    const { admissionFee, monthlyFee } = getFeeDetails();
    const totalFee = admissionFee + monthlyFee;
    const currency = formData.residency === "PROBASHI" ? "$" : "৳";

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const coursesData = await getAcademicStructure();
        setCourses(coursesData);
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber) {
                toast.error("অনুগ্রহ করে সকল তথ্য পূরণ করুন");
                return;
            }
        }
        if (step === 3) {
            if (!formData.batchId) {
                toast.error("অনুগ্রহ করে ব্যাচ/সেমিস্টার নির্বাচন করুন");
                return;
            }
        }
        setStep(s => s + 1);
    };

    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await registerStudentAndPay({
                ...formData,
                gender: formData.gender as "MALE" | "FEMALE",
                mode: formData.mode as "ONLINE" | "OFFLINE",
                residency: formData.residency as "LOCAL" | "PROBASHI",
            });

            if (res.success && res.url) {
                toast.success("পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...");
                window.location.href = res.url;
            } else {
                toast.error(res.error || "রেজিষ্ট্রেশন ব্যর্থ হয়েছে");
                setLoading(false);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("একটি ত্রুটি হয়েছে, আবার চেষ্টা করুন");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl border-zinc-200 dark:border-zinc-800">
                <CardHeader className="space-y-1 text-center border-b bg-white dark:bg-zinc-900 rounded-t-xl pb-6">
                    <CardTitle className="text-2xl font-bold font-bengali text-teal-700 dark:text-teal-500">
                        নতুন ছাত্র রেজিষ্ট্রেশন
                    </CardTitle>
                    <CardDescription className="font-bengali text-base">
                        ইন্টারনেট মাদরাসায় স্বাগতম। আপনার তথ্য প্রদান করে ভর্তি নিশ্চিত করুন।
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Stepper */}
                    <div className="flex justify-between px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b">
                        {[
                            { id: 1, icon: User, label: "পরিচয়" },
                            { id: 2, icon: Globe, label: "মোড" },
                            { id: 3, icon: BookOpen, label: "একাডেমিক" },
                            { id: 4, icon: CreditCard, label: "পেমেন্ট" }
                        ].map((s) => (
                            <div key={s.id} className={`flex flex-col items-center gap-1 ${step >= s.id ? 'text-teal-600' : 'text-zinc-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s.id ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-zinc-200'}`}>
                                    <s.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-medium hidden sm:block font-bengali">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 min-h-[400px]">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 font-bengali border-l-4 border-teal-500 pl-3">
                                    প্রাথমিক পরিচিতি
                                </h3>
                                <div className="grid gap-4 py-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullName" className="font-bengali">পুরো নাম (বাংলায়)</Label>
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
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="font-bengali">পাসওয়ার্ড</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="******"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 font-bengali border-l-4 border-teal-500 pl-3">
                                    মোড এবং আবাসন
                                </h3>
                                <div className="grid gap-6 py-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-bengali text-base">ক্লাস করার মাধ্যম</Label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    onClick={() => setFormData({ ...formData, mode: "OFFLINE" })}
                                                    className={`p-3 rounded-lg border-2 text-left transition-all ${formData.mode === 'OFFLINE' ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-zinc-200 hover:border-zinc-300'}`}
                                                >
                                                    <div className="font-semibold font-bengali">অফলাইন (ক্যাম্পাসে)</div>
                                                    <div className="text-xs text-zinc-500 mt-1">সরাসরি মাদরাসায় এসে ক্লাস করুন</div>
                                                </button>
                                                <button
                                                    onClick={() => setFormData({ ...formData, mode: "ONLINE" })}
                                                    className={`p-3 rounded-lg border-2 text-left transition-all ${formData.mode === 'ONLINE' ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-zinc-200 hover:border-zinc-300'}`}
                                                >
                                                    <div className="font-semibold font-bengali">অনলাইন</div>
                                                    <div className="text-xs text-zinc-500 mt-1">বাসায় বসে ইন্টারনেটের মাধ্যমে ক্লাস করুন</div>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="font-bengali text-base">আপনার অবস্থান</Label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    onClick={() => setFormData({ ...formData, residency: "LOCAL" })}
                                                    className={`p-3 rounded-lg border-2 text-left transition-all ${formData.residency === 'LOCAL' ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-zinc-200 hover:border-zinc-300'}`}
                                                >
                                                    <div className="font-semibold font-bengali">বাংলাদেশি</div>
                                                    <div className="text-xs text-zinc-500 mt-1">আমি বর্তমানে বাংলাদেশে আছি</div>
                                                </button>
                                                <button
                                                    onClick={() => setFormData({ ...formData, residency: "PROBASHI" })}
                                                    className={`p-3 rounded-lg border-2 text-left transition-all ${formData.residency === 'PROBASHI' ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-zinc-200 hover:border-zinc-300'}`}
                                                >
                                                    <div className="font-semibold font-bengali">প্রবাসী</div>
                                                    <div className="text-xs text-zinc-500 mt-1">আমি বাংলাদেশের বাইরে আছি</div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.residency === 'PROBASHI' && (
                                        <div className="grid gap-2 animate-in zoom-in-95 duration-200">
                                            <Label className="font-bengali">বর্তমান দেশ</Label>
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
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp" className="font-bengali">হোয়াটসঅ্যাপ নম্বর (যোগাযোগের জন্য)</Label>
                                        <Input
                                            id="whatsapp"
                                            value={formData.whatsappNumber}
                                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                            placeholder="+880..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 font-bengali border-l-4 border-teal-500 pl-3">
                                    একাডেমিক তথ্য
                                </h3>
                                <div className="grid gap-4 py-2">
                                    <div className="grid gap-2">
                                        <Label className="font-bengali">মারহালা / ক্লাস</Label>
                                        <Select
                                            value={selectedCourse}
                                            onValueChange={(val) => {
                                                setSelectedCourse(val);
                                                setSelectedDepartment("");
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

                                    <div className="grid gap-2">
                                        <Label className="font-bengali">সেমিস্টার / ব্যাচ</Label>
                                        <Select
                                            value={formData.batchId}
                                            disabled={!selectedDepartment}
                                            onValueChange={(val) => {
                                                // Auto-generate Student ID Logic
                                                const currentYear = new Date().getFullYear();
                                                const deptCode = selectedDepartmentData?.code || "DEP";
                                                const selectedBatch = availableBatches.find((b: any) => b.id === val);
                                                const batchName = selectedBatch?.name || "";
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
                                                {availableBatches.map((batch: any) => (
                                                    <SelectItem key={batch.id} value={batch.id}>
                                                        {batch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm font-bengali">
                                        <p>আপনার অটো-জেনারেটেড স্টুডেন্ট আইডি: <strong>{formData.studentID || "নির্বাচনের পর দেখা যাবে"}</strong></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 font-bengali border-l-4 border-teal-500 pl-3">
                                    নিশ্চিতকরণ ও পেমেন্ট
                                </h3>

                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden">
                                        <div className="p-4 bg-zinc-50 border-b font-medium text-zinc-500 font-bengali">
                                            আপনার তথ্যসমূহ
                                        </div>
                                        <div className="p-4 space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500 font-bengali">নাম</span>
                                                <span className="font-medium font-bengali">{formData.fullName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500 font-bengali">ইমেইল</span>
                                                <span className="font-medium">{formData.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500 font-bengali">মোবাইল</span>
                                                <span className="font-medium">{formData.phoneNumber}</span>
                                            </div>
                                            <div className="border-t my-2"></div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500 font-bengali">কোর্স</span>
                                                <span className="font-medium font-bengali">{selectedCourse && courses.find(c => c.id === selectedCourse)?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500 font-bengali">ব্যাচ</span>
                                                <span className="font-medium font-bengali">{selectedBatchData?.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/50 rounded-xl p-6">
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm font-bengali text-zinc-600">
                                                <span>ভর্তি ফি</span>
                                                <span>{currency} {admissionFee}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bengali text-zinc-600">
                                                <span>মাসিক ফি (১ মাসের)</span>
                                                <span>{currency} {monthlyFee}</span>
                                            </div>
                                            <div className="border-t border-teal-200 dark:border-teal-800 my-2"></div>
                                            <div className="flex justify-between font-bold text-lg font-bengali text-teal-800 dark:text-teal-400">
                                                <span>সর্বমোট পরিশোধযোগ্য</span>
                                                <span>{currency} {totalFee}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-center text-teal-600/80 font-bengali">
                                            আপনার {formData.residency === 'PROBASHI' ? 'প্রবাসী' : 'লোকাল'} এবং {formData.mode === 'ONLINE' ? 'অনলাইন' : 'অফলাইন'} মোড অনুযায়ী নির্ধারিত ফি।
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-xl border-t flex justify-between items-center">
                    {step === 1 ? (
                        <Link href="/auth/login">
                            <Button variant="ghost" className="font-bengali">লগইন পেজে যান</Button>
                        </Link>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={loading}
                            className="font-bengali"
                        >
                            পিছনের ধাপ
                        </Button>
                    )}

                    {step < 4 ? (
                        <Button onClick={handleNext} disabled={loading} className="bg-teal-600 hover:bg-teal-700 font-bengali">
                            পরবর্তী ধাপ <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-teal-600 hover:bg-teal-700 min-w-[160px] font-bengali"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'পেমেন্ট করুন'}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
