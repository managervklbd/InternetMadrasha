"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    getAssignedBatches,
    getTeacherSessions,
    getSessionAttendance,
    markOfflineAttendance
} from "@/lib/actions/teacher-portal-actions";
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Search,
    Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AttendancePage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");

    const [batches, setBatches] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingAttendance, setFetchingAttendance] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const [bData, sData] = await Promise.all([
                    getAssignedBatches(),
                    getTeacherSessions()
                ]);
                setBatches(bData);
                setSessions(sData);

                if (bData.length > 0) {
                    setSelectedBatchId(bData[0].id);
                    // If no sessionId in URL, find if there's an active session for this batch today
                    if (!sessionId) {
                        const batchSession = sData.find((s: any) => s.batchId === bData[0].id);
                        if (batchSession) setActiveSessionId(batchSession.id);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("তথ্য লোড করতে সমস্যা হয়েছে।");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [sessionId]);

    // Handle batch change to update active session if not from URL
    useEffect(() => {
        if (!sessionId && selectedBatchId && sessions.length > 0) {
            const batchSession = sessions.find((s: any) => s.batchId === selectedBatchId);
            setActiveSessionId(batchSession?.id || null);
        }
    }, [selectedBatchId, sessions, sessionId]);

    // Fetch attendance records for the active session
    useEffect(() => {
        if (activeSessionId) {
            const fetchAttendance = async () => {
                setFetchingAttendance(true);
                try {
                    const data = await getSessionAttendance(activeSessionId);
                    setAttendanceData(data);
                } catch (err) {
                    console.error("Failed to fetch attendance:", err);
                } finally {
                    setFetchingAttendance(false);
                }
            };
            fetchAttendance();
        } else {
            setAttendanceData([]);
        }
    }, [activeSessionId]);

    const currentBatch = batches.find(b => b.id === selectedBatchId);
    const allStudents = currentBatch?.enrollments?.map((e: any) => e.student) || [];

    const students = allStudents.filter((s: any) =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentID.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (studentId: string, status: any) => {
        if (!activeSessionId) {
            toast.error("সেশন সিলেক্ট করা নেই।");
            return;
        }
        setSaving(studentId);
        try {
            await markOfflineAttendance({
                sessionId: activeSessionId,
                studentId,
                status
            });
            // Re-fetch attendance to update UI
            const updatedAttendance = await getSessionAttendance(activeSessionId);
            setAttendanceData(updatedAttendance);
            toast.success("হাজিরা সংরক্ষিত হয়েছে।");
        } catch (err: any) {
            toast.error(err.message || "ত্রুটি হয়েছে।");
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali">হাজিরা রেজিস্ট্রি</h1>
                    <p className="text-zinc-500 text-lg font-bengali">অফলাইন শিক্ষার্থীদের হাজিরা দিন এবং অনলাইন অংশগ্রহণ মনিটর করুন।</p>
                </div>

                {activeSessionId && (
                    <Badge variant="secondary" className="px-4 py-1 text-sm bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200 font-bengali">
                        সক্রিয় সেশন আইডি: {activeSessionId.split("-")[0]}...
                    </Badge>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="space-y-1 w-full md:w-64">
                        <Label className="text-xs uppercase text-zinc-500 font-bold tracking-widest font-bengali">ব্যাচ নির্বাচন করুন</Label>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="h-11 font-bengali">
                                <SelectValue placeholder="ব্যাচ নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.length > 0 ? (
                                    batches.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="font-bengali">
                                            {b.name} ({b.allowedMode === "ONLINE" ? "অনলাইন" : "অফলাইন"})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled className="font-bengali">কোনো ব্যাচ পাওয়া যায়নি</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {sessions.filter(s => s.batchId === selectedBatchId).length > 1 && (
                        <div className="space-y-1 w-full md:w-48">
                            <Label className="text-xs uppercase text-zinc-500 font-bold tracking-widest font-bengali">সেশন নির্বাচন করুন</Label>
                            <Select value={activeSessionId || ""} onValueChange={setActiveSessionId}>
                                <SelectTrigger className="h-11 font-bengali">
                                    <SelectValue placeholder="সেশন নির্বাচন" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.filter(s => s.batchId === selectedBatchId).map(s => (
                                        <SelectItem key={s.id} value={s.id} className="font-bengali">
                                            {new Date(s.startTime).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="ছাত্রের নাম খুঁজুন..."
                            className="pl-10 h-11 font-bengali"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="w-[120px] font-bengali text-center">ছাত্র আইডি</TableHead>
                            <TableHead className="font-bengali">পূর্ণ নাম</TableHead>
                            <TableHead className="font-bengali">বর্তমান মোড</TableHead>
                            <TableHead className="font-bengali text-center">সেশন জয়েন টাইম</TableHead>
                            <TableHead className="w-[180px] font-bengali">হাজিরা স্ট্যাটাস</TableHead>
                            <TableHead className="text-right font-bengali">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic font-bengali">
                                    রেকর্ড লোড হচ্ছে...
                                </TableCell>
                            </TableRow>
                        ) : allStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic font-bengali">
                                    এই ব্যাচে এখনো কোনো ছাত্র ভর্তি করা হয়নি।
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic font-bengali">
                                    "{searchTerm}" নামে কোনো ছাত্র পাওয়া যায়নি।
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student: any) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-mono text-sm text-zinc-500 text-center">{student.studentID}</TableCell>
                                    <TableCell className="font-semibold font-bengali">{student.fullName}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.mode === "ONLINE" ? "secondary" : "outline"} className="capitalize font-bengali">
                                            {student.mode === "ONLINE" ? "অনলাইন" : "অফলাইন"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-xs text-zinc-500">
                                        {attendanceData.find(a => a.studentId === student.id)?.joinTime
                                            ? new Date(attendanceData.find(a => a.studentId === student.id).joinTime).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {student.mode === "ONLINE" ? (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 font-bengali">
                                                <Clock className="w-3 h-3" />
                                                পোর্টাল থেকে স্বয়ংক্রিয়
                                            </div>
                                        ) : (
                                            <Select
                                                disabled={saving === student.id || !activeSessionId || fetchingAttendance}
                                                value={attendanceData.find(a => a.studentId === student.id)?.status || ""}
                                                onValueChange={(val) => handleStatusChange(student.id, val)}
                                            >
                                                <SelectTrigger className="h-9 font-bengali">
                                                    <SelectValue placeholder="হাজিরা দিন" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PRESENT" className="font-bengali">উপস্থিত</SelectItem>
                                                    <SelectItem value="ABSENT" className="font-bengali">অনুপস্থিত</SelectItem>
                                                    <SelectItem value="LATE" className="font-bengali">বিলম্বে</SelectItem>
                                                    <SelectItem value="EXCUSED" className="font-bengali">ছুটি</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {saving === student.id ? (
                                            <span className="text-xs text-zinc-400 animate-pulse font-bengali">সংরক্ষিত হচ্ছে...</span>
                                        ) : (
                                            <div className="flex justify-end">
                                                <Check className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!activeSessionId && (
                <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 p-4 rounded-lg flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-400 font-bengali">কোনো সক্রিয় সেশন পাওয়া যায়নি</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-500 font-bengali">
                            এই ব্যাচের জন্য আজকে কোনো সেশন তৈরি করা নেই। হাজিরা দিতে ড্যাশবোর্ড থেকে সেশন তৈরি করুন অথবা অ্যাডমিন প্যানেল থেকে সেশন সেটআপ নিশ্চিত করুন।
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
