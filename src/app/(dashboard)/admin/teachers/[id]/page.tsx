"use client";

import { useEffect, useState, use } from "react";
import { getTeacherById, resendInvitation } from "@/lib/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard, User, Pencil, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditTeacherModal } from "@/components/admin/teachers/EditTeacherModal";
import { toast } from "sonner";

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [teacher, setTeacher] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [resendLoading, setResendLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchTeacher = async () => {
        setLoading(true);
        try {
            const data = await getTeacherById(id);
            if (!data) {
                setTeacher(null);
            } else {
                setTeacher(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacher();
    }, [id]);

    const handleResendInvitation = async () => {
        setResendLoading(true);
        try {
            const res = await resendInvitation(id);
            if (res.success) {
                toast.success("সফল! ইনভাইটেশন ইমেইল পুনরায় পাঠানো হয়েছে।");
            } else {
                throw new Error("Failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("ব্যর্থ! ইমেইল পাঠানো সম্ভব হয়নি।");
        } finally {
            setResendLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!teacher) {
        return <div className="p-8 text-center text-red-500 font-bengali">শিক্ষক খুঁজে পাওয়া যায়নি</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/teachers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold font-bengali text-zinc-900 dark:text-zinc-100">
                            শিক্ষকের প্রোফাইল
                        </h1>
                        <p className="text-sm text-zinc-500 font-bengali">
                            বিস্তারিত তথ্য এবং সেটিংস
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleResendInvitation}
                        className="gap-2 font-bengali"
                        disabled={resendLoading}
                    >
                        {resendLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {resendLoading ? "পাঠানো হচ্ছে..." : "নিমন্ত্রণ পুনরায় পাঠান"}
                    </Button>
                    <Button onClick={() => setIsEditOpen(true)} className="gap-2 bg-teal-600 hover:bg-teal-700 font-bengali">
                        <Pencil className="w-4 h-4" />
                        তথ্য পরিবর্তন করুন
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                            <User className="w-12 h-12 text-teal-600" />
                        </div>
                        <h2 className="text-xl font-bold font-bengali">{teacher.fullName}</h2>
                        <div className="flex items-center gap-2 mt-2 text-zinc-500">
                            <Briefcase className="w-4 h-4" />
                            <span className="font-bengali">{teacher.designation}</span>
                        </div>
                        <Badge
                            className={`mt-4 ${teacher.activeStatus ? "bg-teal-600" : "bg-red-500"
                                }`}
                        >
                            {teacher.activeStatus ? "Active" : "Inactive"}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-bengali">ব্যক্তিগত ও যোগাযোগের তথ্য</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 font-bengali">ইমেইল</label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-zinc-400" />
                                    {teacher.user.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 font-bengali">ফোন</label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-zinc-400" />
                                    {teacher.phone || "N/A"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 font-bengali">লিঙ্গ</label>
                                <div className="text-sm">{teacher.gender}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 font-bengali">যোগদান তারিখ</label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                    {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "N/A"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 font-bengali">ঠিকানা</label>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-zinc-400" />
                                    {teacher.address || "N/A"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Info */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-bengali">আর্থিক তথ্য</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <div className="text-xs text-zinc-500 font-bengali mb-1">মাসিক বেতন</div>
                                <div className="text-xl font-bold font-mono">৳ {teacher.salary}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <div className="text-xs text-zinc-500 font-bengali mb-1">পেমেন্ট মেথড</div>
                                <div className="flex items-center gap-2 font-medium">
                                    <CreditCard className="w-4 h-4 text-teal-600" />
                                    {teacher.paymentMethod}
                                </div>
                            </div>
                            {teacher.paymentMethod === "BANK" && (
                                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-xs text-zinc-500 font-bengali mb-1">ব্যাংক একাউন্ট</div>
                                    <div className="font-mono text-sm">{teacher.bankAccountNumber}</div>
                                </div>
                            )}
                            {teacher.paymentMethod === "MOBILE_BANKING" && (
                                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-xs text-zinc-500 font-bengali mb-1">মোবাইল ব্যাংকিং</div>
                                    <div className="font-mono text-sm">{teacher.mobileBankingNumber}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EditTeacherModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                teacher={teacher}
                onSuccess={fetchTeacher}
            />
        </div>
    );
}
