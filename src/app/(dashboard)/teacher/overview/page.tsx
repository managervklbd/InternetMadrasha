import { auth } from "@/auth";
import { getAssignedBatches, getTeacherSessions } from "@/lib/actions/teacher-portal-actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    BookOpen,
    Calendar,
    Clock,
    Users,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboard() {
    const batches = await getAssignedBatches();
    const sessions = await getTeacherSessions();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">আসসালামু আলাইকুম, ওস্তাদ</h1>
                <p className="text-zinc-500 text-lg">আজকের ক্লাসের শিডিউল এবং ওভারভিউ নিচে দেওয়া হলো।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">নির্ধারিত ব্যাচ</CardTitle>
                        <BookOpen className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{batches.length}</div>
                        <p className="text-xs text-zinc-500 mt-1">সক্রিয় ক্লাস গ্রুপ</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">আজকের ক্লাস</CardTitle>
                        <Calendar className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sessions.length}</div>
                        <p className="text-xs text-zinc-500 mt-1">আজকের জন্য নির্ধারিত ক্লাস</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">অপেক্ষমান যাচাই</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-zinc-500 mt-1">মূল্যায়নের অপেক্ষায় থাকা হোমওয়ার্ক</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Today's Classes */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader>
                        <CardTitle>আসন্ন সেশন</CardTitle>
                        <CardDescription>আজকের মার্কিং শিট এবং অনলাইন মনিটরিং অ্যাক্সেস।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sessions.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500 italic">
                                আজকের জন্য কোনো ক্লাস নির্ধারিত নেই।
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{session.batch.name}</p>
                                                <p className="text-xs text-zinc-500">
                                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                    {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={`/teacher/attendance?sessionId=${session.id}`}>
                                            <Button variant="outline" size="sm">হাজিরা দিন</Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* My Batches */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader>
                        <CardTitle>আমার সক্রিয় ব্যাচসমূহ</CardTitle>
                        <CardDescription>আপনার নির্ধারিত ছাত্র গ্রুপসমূহের ওভারভিউ।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {batches.map((batch) => (
                                <div key={batch.id} className="flex items-center justify-between py-2 border-b last:border-0 border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <p className="font-medium">{batch.name}</p>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">{batch.department.course.name} - {batch.department.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-medium">{batch._count.enrollments}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
