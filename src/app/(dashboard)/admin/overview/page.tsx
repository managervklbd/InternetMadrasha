import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Users,
    BookOpen,
    CreditCard,
    Plus,
    Settings,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminOverviewStats } from "@/lib/actions/report-actions";
import { getAdminViewMode } from "@/lib/actions/settings-actions";

export default async function AdminOverview() {
    const viewMode = await getAdminViewMode();
    const stats = await getAdminOverviewStats(viewMode);

    return (
        <div className="flex-1 space-y-6">
            {/* Greeting Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 p-8 shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BookOpen className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-2 font-bengali">আসসালামু আলাইকুম, অ্যাডমিন</h2>
                    <p className="text-teal-100 max-w-xl">
                        ইন্টারনেট মাদ্রাসা ম্যানেজমেন্ট প্যানেলে আপনাকে স্বাগতম। আজকের কার্যক্রম শুরু করার জন্য নিচের পরিসংখ্যানগুলো দেখুন।
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-bengali">
                    ড্যাশবোর্ড ওভারভিউ
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-t-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
                        <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            রেজিস্ট্রারকৃত সকল শিক্ষার্থী
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট শিক্ষক</CardTitle>
                        <UserCircle className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">{stats?.totalTeachers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            নিয়োগপ্রাপ্ত শিক্ষক
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট আয় (চলতি মাস)</CardTitle>
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">৳ {stats?.totalRevenue?.toLocaleString('bn-BD') || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            চলতি মাসের মোট কালেকশন
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট কোর্স</CardTitle>
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">{stats?.activeBatches || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            একাডেমিক কোর্স সমূহ
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader>
                        <CardTitle className="font-bengali">সাম্প্রতিক কার্যকলাপ</CardTitle>
                        <CardDescription className="font-bengali">সাম্প্রতিক ছাত্র ভর্তি এবং ইনভয়েস ইভেন্ট।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.activities && stats.activities.length > 0 ? (
                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {stats.activities.map((activity: any) => (
                                    <div key={activity.id} className="flex items-start gap-4 group">
                                        <div className={`mt-1 h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${activity.type === 'ENROLLMENT'
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                            }`}>
                                            {activity.type === 'ENROLLMENT' ? <Users className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-bengali truncate">
                                                    {activity.title}
                                                </p>
                                                <time className="text-[10px] text-zinc-400 font-mono shrink-0">
                                                    {new Date(activity.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                                                </time>
                                            </div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bengali mt-0.5">
                                                {activity.type === 'ENROLLMENT' ? 'নতুন ভর্তি:' : 'পেমেন্ট সংগ্রহ:'} {activity.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-zinc-500 text-center py-12 italic font-bengali">
                                এই সেশনে কোনো সাম্প্রতিক ইভেন্ট নেই।
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader>
                        <CardTitle>দ্রুত অ্যাক্সেস</CardTitle>
                        <CardDescription>সাধারণ প্রশাসনিক কাজ।</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Link href="/admin/students" className="block">
                            <Button variant="outline" className="h-20 flex-col gap-2 border-dashed w-full">
                                <Users className="w-5 h-5" />
                                ছাত্র যোগ করুন
                            </Button>
                        </Link>
                        <Link href="/admin/academics" className="block">
                            <Button variant="outline" className="h-20 flex-col gap-2 border-dashed w-full">
                                <BookOpen className="w-5 h-5" />
                                নতুন ব্যাচ
                            </Button>
                        </Link>
                        <Link href="/admin/billing" className="block">
                            <Button variant="outline" className="h-20 flex-col gap-2 border-dashed w-full">
                                <CreditCard className="w-5 h-5" />
                                বিল তৈরি করুন
                            </Button>
                        </Link>
                        <Link href="/admin/settings" className="block">
                            <Button variant="outline" className="h-20 flex-col gap-2 border-dashed w-full">
                                <Settings className="w-5 h-5" />
                                সাইট সেটিংস
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
