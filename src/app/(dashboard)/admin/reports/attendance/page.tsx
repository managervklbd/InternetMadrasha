import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAttendanceStats } from "@/lib/actions/report-actions";
import { CalendarCheck, Users, Clock, CalendarX } from "lucide-react";
import { AttendanceTrendChart } from "@/components/admin/reports/AttendanceCharts";

export const dynamic = "force-dynamic";

export default async function AttendanceReportsPage() {
    const { today, monthTrend } = await getAttendanceStats();

    // Calculate totals for summary cards
    const presentCount = today.find(s => s.status === 'PRESENT')?.count || 0;
    const absentCount = today.find(s => s.status === 'ABSENT')?.count || 0;
    const lateCount = today.find(s => s.status === 'LATE')?.count || 0;
    const totalToday = presentCount + absentCount + lateCount;

    const presentPercent = totalToday > 0 ? Math.round((presentCount / totalToday) * 100) : 0;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-bengali">
                    হাজিরা রিপোর্ট (Attendance Analytics)
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">আজকের উপস্থিতি</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            উপস্থিত ছাত্রছাত্রী
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">অনুপস্থিত</CardTitle>
                        <CalendarX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            আজ ক্লাসে নেই
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">দেরিতে উপস্থিত</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lateCount}</div>
                        <p className="text-xs text-muted-foreground">
                            নির্ধারিত সময়ের পরে জয়েন
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">উপস্থিতির হার</CardTitle>
                        <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{presentPercent}%</div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-2 w-full bg-zinc-100 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${presentPercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            আজকের গড় উপস্থিতি
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>মাসিক উপস্থিতির প্রবণতা</CardTitle>
                    <CardDescription>
                        চলতি মাসে প্রতিদিনের উপস্থিত ছাত্র সংখ্যা
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <AttendanceTrendChart data={monthTrend} />
                </CardContent>
            </Card>
        </div>
    );
}
