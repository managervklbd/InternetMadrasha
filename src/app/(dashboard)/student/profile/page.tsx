import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Calendar,
    Globe,
    ShieldCheck,
    CreditCard,
    Edit
} from "lucide-react";
import { ProfileEditTrigger } from "@/components/shared/ProfileEditTrigger";

export default async function StudentProfilePage() {
    const session = await auth();
    if (!session?.user) return null;

    const student = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            department: {
                include: { course: true }
            },
            enrollments: {
                include: { batch: true },
                orderBy: { joinedAt: "desc" },
                take: 1
            }
        }
    });

    if (!student) notFound();

    const latestEnrollment = student.enrollments[0];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-teal-100 flex items-center justify-center overflow-hidden">
                        {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-teal-700 text-2xl font-bold">
                                {student.fullName.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{student.fullName}</h1>
                            <Badge variant={student.activeStatus ? "success" : "destructive"}>
                                {student.activeStatus ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-zinc-500 font-medium">Student ID: {student.studentID}</p>
                        <p className="text-zinc-400 text-sm">Joined on {new Date(student.user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <ProfileEditTrigger student={student} />
                    <Badge variant="outline" className="px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200">
                        {student.mode} Mode
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200">
                        {student.residency}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50">
                            <CardTitle className="text-lg flex items-center gap-2 font-bengali">
                                <User className="w-5 h-5 text-teal-600" />
                                ব্যক্তিগত তথ্য
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 flex items-center gap-2 font-bengali">
                                    <Mail className="w-4 h-4" />
                                    ইমেইল ঠিকানা
                                </p>
                                <p className="font-semibold">{student.user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 flex items-center gap-2 font-bengali">
                                    <Phone className="w-4 h-4" />
                                    ফোন নম্বর
                                </p>
                                <p className="font-semibold">{student.phoneNumber || "দেওয়া হয়নি"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 flex items-center gap-2 font-bengali">
                                    <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">WA</span>
                                    হোয়াটসঅ্যাপ নম্বর (প্রবাসী)
                                </p>
                                <p className="font-semibold">{student.whatsappNumber || "প্রযোজ্য নয়"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 flex items-center gap-2 font-bengali">
                                    <MapPin className="w-4 h-4" />
                                    দেশ
                                </p>
                                <p className="font-semibold font-bengali">{student.country || "বাংলাদেশ"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50">
                            <CardTitle className="text-lg flex items-center gap-2 font-bengali">
                                <GraduationCap className="w-5 h-5 text-teal-600" />
                                একাডেমিক তথ্য
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 font-bengali">কোর্স</p>
                                <p className="font-semibold text-teal-600 font-bengali">{student.department?.course.name || "প্রযোজ্য নয়"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 font-bengali">বিভাগ</p>
                                <p className="font-semibold font-bengali">{student.department?.name || "প্রযোজ্য নয়"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 flex items-center gap-2 font-bengali">
                                    <Calendar className="w-4 h-4" />
                                    বর্তমান ব্যাচ (সেমিস্টার)
                                </p>
                                <p className="font-semibold font-bengali">{latestEnrollment?.batch.name || "প্রযোজ্য নয়"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-500 flex items-center gap-2 font-bengali">
                                    <ShieldCheck className="w-4 h-4" />
                                    অ্যাকাউন্ট স্ট্যাটাস
                                </p>
                                <p className="font-semibold text-green-600 font-bengali">ভেরিফাইড (Verified)</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Financial & Quick Links */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-teal-50/30 dark:bg-teal-900/10">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 font-bengali">
                                <CreditCard className="w-5 h-5 text-teal-600" />
                                আর্থিক সারসংক্ষেপ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-teal-100 dark:border-teal-900/20">
                                <span className="text-zinc-600 font-bengali">ফি টিয়ার</span>
                                <Badge variant="outline" className="bg-white dark:bg-zinc-950 font-bengali">
                                    {student.feeTier === 'SADKA' ? 'সাদকা/ছাড়' : 'সাধারণ'}
                                </Badge>
                            </div>
                            <p className="text-xs text-zinc-500 mt-4 italic font-bengali">
                                ইনভয়েস এবং পেমেন্ট ইতিহাসের জন্য দয়া করে 'পেমেন্ট হিস্ট্রি' সেকশন দেখুন।
                            </p>
                        </CardContent>
                    </Card>

                    <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2 font-bengali">সহায়তা প্রয়োজন?</h3>
                            <p className="text-zinc-400 text-sm mb-4 font-bengali">আপনার প্রোফাইল বা একাডেমিক তথ্য নিয়ে সমস্যা হচ্ছে? অ্যাডমিন অফিসে যোগাযোগ করুন।</p>
                            <p className="font-mono text-teal-400">admin@internetmadrasha.com</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <User className="w-24 h-24" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
