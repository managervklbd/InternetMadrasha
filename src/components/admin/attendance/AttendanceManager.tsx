"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    getAdminAttendanceBatches,
    getBatchAttendanceData,
    createAdminClassSession,
    adminMarkAttendance,
    adminBulkMarkAttendance
} from "@/lib/actions/attendance-actions";
import { AttendanceStatus, StudentMode } from "@prisma/client";
import { Calendar, Users, Clock, Save, Plus, Loader2 } from "lucide-react";

export default function AttendanceManager() {
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ students: any[], sessions: any[] }>({ students: [], sessions: [] });
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");

    // For creating new session
    const [showNewSession, setShowNewSession] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");
    const [newStartTime, setNewStartTime] = useState("09:00");
    const [newEndTime, setNewEndTime] = useState("10:00");

    useEffect(() => {
        getAdminAttendanceBatches().then(setBatches);
    }, []);

    useEffect(() => {
        if (selectedBatchId && selectedDate) {
            refreshData();
        }
    }, [selectedBatchId, selectedDate]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const result = await getBatchAttendanceData(selectedBatchId, new Date(selectedDate));
            setData(result);
            if (result.sessions.length > 0) {
                setSelectedSessionId(result.sessions[0].id);
            } else {
                setSelectedSessionId("");
            }
        } catch (error) {
            toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        if (!newSessionName) return toast.error("সেশনের নাম দিন");
        try {
            const res = await createAdminClassSession({
                batchId: selectedBatchId,
                date: new Date(selectedDate),
                name: newSessionName,
                startTime: newStartTime,
                endTime: newEndTime
            });
            if (res.success) {
                toast.success("সেশন তৈরি হয়েছে");
                setShowNewSession(false);
                refreshData();
            }
        } catch (error) {
            toast.error("সেশন তৈরি করতে ব্যর্থ");
        }
    };

    const handleMarkAttendance = async (studentId: string, status: AttendanceStatus, mode: StudentMode) => {
        if (!selectedSessionId) return;
        try {
            const res = await adminMarkAttendance({
                studentId,
                sessionId: selectedSessionId,
                status,
                mode
            });
            if (res.success) {
                // Update local state
                setData(prev => ({
                    ...prev,
                    sessions: prev.sessions.map(s => {
                        if (s.id === selectedSessionId) {
                            const updatedAttendance = [...s.attendance];
                            const idx = updatedAttendance.findIndex(a => a.studentId === studentId);
                            if (idx > -1) {
                                updatedAttendance[idx] = res.attendance;
                            } else {
                                updatedAttendance.push(res.attendance);
                            }
                            return { ...s, attendance: updatedAttendance };
                        }
                        return s;
                    })
                }));
                toast.success("হাজিরা আপডেট হয়েছে");
            }
        } catch (error) {
            toast.error("হাজিরা আপডেট করতে ব্যর্থ");
        }
    };

    const getStatusForStudent = (studentId: string) => {
        const session = data.sessions.find(s => s.id === selectedSessionId);
        if (!session) return null;
        return session.attendance.find((a: any) => a.studentId === studentId);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="font-bengali text-2xl text-teal-900 dark:text-teal-50 flex items-center gap-2">
                        <Users className="h-6 w-6" /> হাজিরা ব্যবস্থাপনা
                    </CardTitle>
                    <CardDescription className="font-bengali">
                        ব্যাচ এবং তারিখ নির্বাচন করে হাজিরা ইনপুট দিন
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium font-bengali px-1">ব্যাচ নির্বাচন করুন</label>
                            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="ব্যাচ সিলেক্ট করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map(b => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.department.course.name} - {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium font-bengali px-1">তারিখ</label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" className="w-full font-bengali" onClick={refreshData} disabled={!selectedBatchId || loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "রিফ্রেশ করুন"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedBatchId && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Session Selector / Creator */}
                    <Card className="lg:col-span-1 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bengali flex items-center justify-between">
                                সেশন সমূহ
                                <Button size="icon" variant="ghost" onClick={() => setShowNewSession(!showNewSession)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {showNewSession && (
                                <div className="p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-3">
                                    <Input
                                        placeholder="সেশনের নাম (উদা: সকাল)"
                                        value={newSessionName}
                                        onChange={e => setNewSessionName(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} className="h-8 text-sm" />
                                        <Input type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} className="h-8 text-sm" />
                                    </div>
                                    <Button size="sm" className="w-full h-8" onClick={handleCreateSession}>তৈরি করুন</Button>
                                </div>
                            )}

                            <div className="space-y-2">
                                {data.sessions.length === 0 ? (
                                    <p className="text-sm text-center py-4 text-muted-foreground font-bengali">কোন সেশন পাওয়া যায়নি</p>
                                ) : (
                                    data.sessions.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => setSelectedSessionId(s.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSessionId === s.id
                                                    ? "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800"
                                                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm">{s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "সেশন"}</span>
                                                <Badge variant="secondary" className="text-[10px]">{s.attendance.length} জন</Badge>
                                            </div>
                                            <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""} -
                                                {s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Student List & Attendance Marking */}
                    <Card className="lg:col-span-3 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-xl font-bengali flex items-center gap-2">
                                ছাত্রছাত্রীদের তালিকা
                                {selectedSessionId && <Badge variant="outline" className="font-normal">সেশন সিলেক্টেড</Badge>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedSessionId ? (
                                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed text-zinc-400 font-bengali">
                                    বাম দিক থেকে একটি সেশন নির্বাচন করুন
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bengali">নাম ও আইডি</TableHead>
                                            <TableHead className="font-bengali text-center">উপস্থিতি</TableHead>
                                            <TableHead className="font-bengali text-right">মোড (Mode)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.students.map(student => {
                                            const att = getStatusForStudent(student.id);
                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <div className="font-bold">{student.fullName}</div>
                                                        <div className="text-[10px] text-zinc-500 font-mono">{student.studentID}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant={att?.status === 'PRESENT' ? 'default' : 'outline'}
                                                                className={`h-7 px-2 text-[10px] font-bengali ${att?.status === 'PRESENT' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                                                onClick={() => handleMarkAttendance(student.id, 'PRESENT', student.mode)}
                                                            >
                                                                উপস্থিত
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={att?.status === 'ABSENT' ? 'destructive' : 'outline'}
                                                                className="h-7 px-2 text-[10px] font-bengali"
                                                                onClick={() => handleMarkAttendance(student.id, 'ABSENT', student.mode)}
                                                            >
                                                                অনুপস্থিত
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={att?.status === 'LATE' ? 'default' : 'outline'}
                                                                className={`h-7 px-2 text-[10px] font-bengali ${att?.status === 'LATE' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                                                                onClick={() => handleMarkAttendance(student.id, 'LATE', student.mode)}
                                                            >
                                                                দেরি
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {student.mode === 'ONLINE' ? 'অনলাইন' : 'অফলাইন'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
