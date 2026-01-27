"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Clock,
    LogIn,
    LogOut,
    Calendar,
    TrendingUp,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import {
    checkInTeacher,
    checkOutTeacher,
    getTeacherTodayAttendance,
    getTeacherAttendanceHistory,
    getTeacherAttendanceStats
} from "@/lib/actions/teacher-attendance-actions";
import { toast } from "sonner";

export default function TeacherHajiraPage() {
    const [todayAttendance, setTodayAttendance] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [today, historyData, statsData] = await Promise.all([
                getTeacherTodayAttendance(),
                getTeacherAttendanceHistory({ limit: 30 }),
                getTeacherAttendanceStats()
            ]);
            setTodayAttendance(today);
            setHistory(historyData);
            setStats(statsData.stats);
        } catch (error) {
            console.error(error);
            toast.error("তথ্য লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            await checkInTeacher();
            toast.success("চেক-ইন সফল হয়েছে!");
            await loadData();
        } catch (error: any) {
            toast.error(error.message || "চেক-ইন ব্যর্থ হয়েছে।");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            await checkOutTeacher();
            toast.success("চেক-আউট সফল হয়েছে!");
            await loadData();
        } catch (error: any) {
            toast.error(error.message || "চেক-আউট ব্যর্থ হয়েছে।");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            PRESENT: { variant: "default", className: "bg-green-100 text-green-700 border-green-200", label: "উপস্থিত" },
            LATE: { variant: "secondary", className: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "বিলম্বে" },
            ABSENT: { variant: "destructive", className: "bg-red-100 text-red-700 border-red-200", label: "অনুপস্থিত" },
            HALF_DAY: { variant: "outline", className: "bg-orange-100 text-orange-700 border-orange-200", label: "অর্ধদিবস" },
            LEAVE: { variant: "outline", className: "bg-blue-100 text-blue-700 border-blue-200", label: "ছুটি" },
            SICK_LEAVE: { variant: "outline", className: "bg-purple-100 text-purple-700 border-purple-200", label: "অসুস্থতা ছুটি" },
        };
        const config = variants[status] || variants.PRESENT;
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali">শিক্ষক হাজিরা</h1>
                <p className="text-zinc-500 text-lg font-bengali">আপনার দৈনিক উপস্থিতি রেকর্ড করুন এবং কর্মঘণ্টা ট্র্যাক করুন।</p>
            </div>

            {/* Today's Attendance Card */}
            <Card className="border-none shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bengali">আজকের হাজিরা</CardTitle>
                            <CardDescription className="text-lg font-bengali">
                                {currentTime.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-teal-600 font-mono">
                                {currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-sm text-zinc-500 font-bengali">বর্তমান সময়</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="text-center py-8 text-zinc-500 font-bengali">লোড হচ্ছে...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Check-in Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <LogIn className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-zinc-500 font-bengali">চেক-ইন সময়</div>
                                        <div className="text-2xl font-bold font-mono">
                                            {todayAttendance?.checkIn
                                                ? new Date(todayAttendance.checkIn).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                                                : "--:--"}
                                        </div>
                                    </div>
                                </div>
                                {!todayAttendance && (
                                    <Button
                                        onClick={handleCheckIn}
                                        disabled={actionLoading}
                                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bengali"
                                    >
                                        <LogIn className="w-5 h-5 mr-2" />
                                        চেক-ইন করুন
                                    </Button>
                                )}
                            </div>

                            {/* Check-out Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                        <LogOut className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-zinc-500 font-bengali">চেক-আউট সময়</div>
                                        <div className="text-2xl font-bold font-mono">
                                            {todayAttendance?.checkOut
                                                ? new Date(todayAttendance.checkOut).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                                                : "--:--"}
                                        </div>
                                    </div>
                                </div>
                                {todayAttendance && !todayAttendance.checkOut && (
                                    <Button
                                        onClick={handleCheckOut}
                                        disabled={actionLoading}
                                        className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg font-bengali"
                                    >
                                        <LogOut className="w-5 h-5 mr-2" />
                                        চেক-আউট করুন
                                    </Button>
                                )}
                            </div>

                            {/* Status and Working Hours */}
                            {todayAttendance && (
                                <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <div className="text-sm text-zinc-500 mb-2 font-bengali">স্ট্যাটাস</div>
                                        {getStatusBadge(todayAttendance.status)}
                                    </div>
                                    <div>
                                        <div className="text-sm text-zinc-500 mb-2 font-bengali">কর্মঘণ্টা</div>
                                        <div className="text-xl font-bold text-teal-600">
                                            {todayAttendance.workingHours ? `${todayAttendance.workingHours.toFixed(2)} ঘণ্টা` : "চলমান..."}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.present}</div>
                                    <div className="text-sm text-zinc-500 font-bengali">উপস্থিত</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-8 h-8 text-red-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.absent}</div>
                                    <div className="text-sm text-zinc-500 font-bengali">অনুপস্থিত</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-8 h-8 text-yellow-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.late}</div>
                                    <div className="text-sm text-zinc-500 font-bengali">বিলম্বে</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-8 h-8 text-teal-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.totalWorkingHours.toFixed(1)}</div>
                                    <div className="text-sm text-zinc-500 font-bengali">মোট ঘণ্টা</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Attendance History */}
            <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-bengali">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        হাজিরা ইতিহাস
                    </CardTitle>
                    <CardDescription className="font-bengali">গত ৩০ দিনের রেকর্ড</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                <TableRow>
                                    <TableHead className="font-bengali">তারিখ</TableHead>
                                    <TableHead className="font-bengali">চেক-ইন</TableHead>
                                    <TableHead className="font-bengali">চেক-আউট</TableHead>
                                    <TableHead className="font-bengali">কর্মঘণ্টা</TableHead>
                                    <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-zinc-500 font-bengali">
                                            কোনো রেকর্ড পাওয়া যায়নি
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-bengali">
                                                {new Date(record.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {new Date(record.checkIn).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {record.checkOut
                                                    ? new Date(record.checkOut).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {record.workingHours ? `${record.workingHours.toFixed(2)}h` : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(record.status)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
