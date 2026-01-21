import { getStudentById } from "@/lib/actions/student-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, MapPin, GraduationCap, CreditCard } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ManualPasswordReset } from "@/components/admin/students/ManualPasswordReset";
import { StudentProfileActions } from "@/components/admin/students/StudentProfileActions";
import { ProfileEditTrigger } from "@/components/shared/ProfileEditTrigger";
import { PaymentHistoryModal } from "@/components/admin/students/PaymentHistoryModal";

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
    const student = await getStudentById(params.id);

    if (!student) {
        notFound();
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/students">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold font-bengali">{student.fullName}</h1>
                    <p className="text-zinc-500 font-mono text-sm">{student.studentID}</p>
                </div>
                <div className="ml-auto flex gap-2 items-center">
                    <ProfileEditTrigger student={student} isAdmin={true} />
                    <StudentProfileActions studentId={student.id} />
                    <Badge variant={student.activeStatus ? "success" : "destructive"}>
                        {student.activeStatus ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{student.mode}</Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Personal Info */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b pb-4">
                        <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900 mx-auto flex items-center justify-center text-3xl font-bold text-teal-600">
                            {student.fullName.charAt(0)}
                        </div>
                        <div className="text-center mt-3">
                            <h2 className="font-bold font-bengali text-lg">{student.fullName}</h2>
                            <p className="text-sm text-zinc-500">{student.user.email}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-zinc-400" />
                            <span>{student.phoneNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="w-4 h-4 flex items-center justify-center text-zinc-400 font-bold text-[10px] bg-zinc-100 rounded">WA</span>
                            <span>{student.whatsappNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                            <div>
                                <p className="font-medium">{student.residency}</p>
                                {student.country && <p className="text-zinc-500 text-xs">{student.country}</p>}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <ManualPasswordReset studentId={student.id} studentName={student.fullName} />
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Academic & Stats */}
                <div className="md:col-span-2 space-y-6">
                    {/* Academic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-bengali text-lg">
                                <GraduationCap className="w-5 h-5 text-teal-600" />
                                একাডেমিক তথ্য
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border">
                                <p className="text-xs text-zinc-500 mb-1 font-bengali">বিভাগ (Department)</p>
                                <p className="font-medium font-bengali">{student.department?.name || "N/A"}</p>
                                {student.department?.code && (
                                    <Badge variant="secondary" className="mt-1 font-mono text-[10px]">
                                        {student.department.code}
                                    </Badge>
                                )}
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border">
                                <p className="text-xs text-zinc-500 mb-1 font-bengali">বর্তমান ব্যাচ / সেশন</p>
                                {student.enrollments.length > 0 ? (
                                    <div className="space-y-1">
                                        {student.enrollments.map((enr: any) => (
                                            <Badge key={enr.id} variant="outline" className="mr-1 mb-1 font-bengali">
                                                {enr.batch?.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-zinc-400 italic font-bengali">কোনো ব্যাচে যুক্ত নেই</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-bengali text-lg">
                                <CreditCard className="w-5 h-5 text-teal-600" />
                                পেমেন্ট ও প্ল্যান
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900">
                                <div>
                                    <p className="text-sm font-medium font-bengali">বর্তমান প্ল্যান</p>
                                    <p className="text-xl font-bold font-bengali text-teal-700 dark:text-teal-400">
                                        {student.planHistory && student.planHistory[0]?.plan
                                            ? student.planHistory[0].plan.name
                                            : `একাডেমিক ফি (${(student as any).feeTier === 'SADKA' ? 'সাদকা/ছাড়' : 'রেগুলার'})`
                                        }
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 font-bengali">ফি পরিমান</p>
                                    <p className="font-mono font-bold text-lg">
                                        ৳ {(() => {
                                            // 1. Custom Plan
                                            if (student.planHistory && student.planHistory[0]?.plan) {
                                                return student.planHistory[0].plan.monthlyFee;
                                            }

                                            // 2. Academic Fee Fallback: Batch -> Dept -> Course
                                            const isSadka = (student as any).feeTier === 'SADKA';
                                            const batch = student.enrollments[0]?.batch as any;
                                            const dept = student.department as any;
                                            const course = student.department?.course as any;

                                            // Helper to pick first non-null/non-zero fee
                                            const getFee = (sVal: number | null, mVal: number | null) => {
                                                const val = isSadka ? sVal : mVal;
                                                return val !== null && val !== undefined ? val : null;
                                            }

                                            // Fallback Chain
                                            const batchFee = batch ? getFee(batch.sadkaFee, batch.monthlyFee) : null;
                                            if (batchFee !== null) return batchFee;

                                            const deptFee = dept ? getFee(dept.sadkaFee, dept.monthlyFee) : null;
                                            if (deptFee !== null) return deptFee;

                                            const courseFee = course ? getFee(course.sadkaFee, course.monthlyFee) : null;
                                            if (courseFee !== null) return courseFee;

                                            return 0;
                                        })()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <PaymentHistoryModal studentId={student.id} studentName={student.fullName} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
