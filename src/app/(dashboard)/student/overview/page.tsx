import { getStudentDashboardData } from "@/lib/actions/student-portal-actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Video,
    CreditCard,
    BookOpen,
    CheckCircle2,
    Calendar,
    Lock,
    Globe
} from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
    const data = await getStudentDashboardData();
    const {
        profile,
        latestInvoice,
        sessions,
        homework,
        homeworkCount,
        attendanceToday,
        monthlyFee,
        currentPlanName
    } = data;

    const isUnpaid = latestInvoice?.status === "UNPAID";
    const isOffline = profile.mode === "OFFLINE";

    return (
        <div className="space-y-8">
            {/* Visual Warnings */}
            <div className="space-y-4">
                {isUnpaid && (
                    <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-900 dark:text-red-400">পেমেন্ট প্রয়োজন</h4>
                                <p className="text-sm text-red-700 dark:text-red-500">আপনার এই মাসের বেতন বকেয়া রয়েছে। ক্লাসের অ্যাক্সেস সীমাবদ্ধ করা হয়েছে।</p>
                            </div>
                        </div>
                        <Link href="/student/billing">
                            <Button className="bg-red-600 hover:bg-red-700">এখনই পরিশোধ করুন</Button>
                        </Link>
                    </div>
                )}

                {isOffline && (
                    <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 p-4 rounded-xl flex items-center gap-4">
                        <Globe className="w-6 h-6 text-blue-600" />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-400">অফলাইন হাজিরা মোড</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-500">আপনার হাজিরা মাদ্রাসায় সরাসরি আপনার ওস্তাদ দ্বারা চিহ্নিত করা হয়।</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">দৈনিক ক্লাস</CardTitle>
                        <Calendar className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sessions.length}</div>
                        <p className="text-xs text-zinc-500 mt-1">আজকের শিডিউল</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">পেমেন্ট স্ট্যাটাস</CardTitle>
                        <CreditCard className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isUnpaid ? 'text-red-600' : 'text-green-600'}`}>
                            {latestInvoice?.status || "কোন ইনভয়েস নেই"}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">মাস: {latestInvoice?.month}/{latestInvoice?.year}</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">এ্যাসাইনমেন্ট</CardTitle>
                        <BookOpen className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{homeworkCount}</div>
                        <p className="text-xs text-zinc-500 mt-1">জমা দেওয়া বাকি</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">আজকের উপস্থিতি</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceToday.length}</div>
                        <p className="text-xs text-zinc-500 mt-1">সেশনে যোগদান/চিহ্নিত</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Class Join Section */}
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950">
                        <CardHeader>
                            <CardTitle>লাইভ ক্লাস</CardTitle>
                            <CardDescription>আপনার নির্ধারিত অনলাইন ক্লাসে এখান থেকে সরাসরি যোগ দিন।</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sessions.length === 0 ? (
                                    <div className="text-center py-12 text-zinc-500 italic">আজকের জন্য কোনো ক্লাস নির্ধারিত নেই।</div>
                                ) : (
                                    sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                                                    <Video className="w-6 h-6 text-teal-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{session.batch.name}</h4>
                                                    <p className="text-xs text-zinc-500">ওস্তাদ: Muhammad Abdullah</p>
                                                </div>
                                            </div>

                                            {isUnpaid ? (
                                                <Button disabled className="gap-2 bg-zinc-200 text-zinc-500">
                                                    <Lock className="w-4 h-4" />
                                                    লক করা
                                                </Button>
                                            ) : isOffline ? (
                                                <Badge variant="outline">শুধুমাত্র অফলাইন</Badge>
                                            ) : (
                                                <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
                                                    ক্লাসে যোগ দিন
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Homework List Section */}
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-teal-600" />
                                সক্রিয় হোমওয়ার্ক
                            </CardTitle>
                            <CardDescription>আপনার জমা দেওয়ার বাকি থাকা কাজসমূহ।</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {homework.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-500 italic">নতুন কোনো হোমওয়ার্ক নেই।</div>
                                ) : (
                                    homework.map((hw) => (
                                        <div key={hw.id} className="p-4 rounded-xl flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                            <div>
                                                <h4 className="font-bold">{hw.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <Badge variant="secondary" className="text-[10px]">{hw.batch.name}</Badge>
                                                    <span className="text-[10px] text-zinc-500">ডেডলাইন: {new Date(hw.deadline).toLocaleDateString('bn-BD')}</span>
                                                </div>
                                            </div>
                                            <Link href={`/student/homework/${hw.id}`}>
                                                <Button size="sm" variant="outline" className="font-bengali">বিস্তারিত</Button>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links / Profile Info */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader>
                        <CardTitle>আমার এনরোলমেন্ট</CardTitle>
                        <CardDescription>একাডেমিক পরিচয় এবং প্ল্যান বিস্তারিত।</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                <span className="text-2xl font-bold text-zinc-400">{profile.fullName[0]}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{profile.fullName}</h3>
                                <p className="text-sm text-zinc-500 uppercase font-mono tracking-tighter">ID: {profile.studentID}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">বর্তমান প্ল্যান</span>
                                <span className="font-bold text-teal-600 font-bengali">{currentPlanName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">মাসিক খরচ</span>
                                <span className="font-bold text-teal-900 dark:text-teal-100">৳{monthlyFee}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">আবাসিক অবস্থা</span>
                                <span className="font-bold capitalize">{profile.residency.toLowerCase()}</span>
                            </div>
                        </div>

                        <Link href="/student/profile">
                            <Button variant="outline" className="w-full mt-4 h-11">সম্পূর্ণ প্রোফাইল দেখুন</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
