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
import {
    getAssignedBatches,
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

export default function AttendancePage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");

    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const data = await getAssignedBatches();
            setBatches(data);
            if (data.length > 0) setSelectedBatchId(data[0].id);
            setLoading(false);
        };
        fetch();
    }, []);

    const currentBatch = batches.find(b => b.id === selectedBatchId);
    const students = currentBatch?.enrollments?.map((e: any) => e.student) || [];

    const handleStatusChange = async (studentId: string, status: any) => {
        if (!sessionId) return;
        setSaving(studentId);
        try {
            await markOfflineAttendance({
                sessionId,
                studentId,
                status
            });
        } catch (err) {
            alert("Only offline students can be marked manually.");
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Registry</h1>
                    <p className="text-zinc-500 text-lg">Mark attendance for offline students and monitor online participation.</p>
                </div>

                {sessionId && (
                    <Badge variant="secondary" className="px-4 py-1 text-sm bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">
                        Active Session ID: {sessionId.split("-")[0]}...
                    </Badge>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="space-y-1 w-full md:w-64">
                        <Label className="text-xs uppercase text-zinc-500 font-bold tracking-widest">Select Batch</Label>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.map(b => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input placeholder="Search student name..." className="pl-10 h-11" />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="w-[120px]">Student ID</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Current Mode</TableHead>
                            <TableHead className="w-[200px]">Attendance Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic">
                                    Retrieving enrollment records...
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic">
                                    No students enrolled in this batch.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student: any) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-mono text-sm text-zinc-500">{student.studentID}</TableCell>
                                    <TableCell className="font-semibold">{student.fullName}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.mode === "ONLINE" ? "secondary" : "outline"} className="capitalize">
                                            {student.mode}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {student.mode === "ONLINE" ? (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                Auto-recorded via Portal
                                            </div>
                                        ) : (
                                            <Select
                                                disabled={saving === student.id || !sessionId}
                                                onValueChange={(val) => handleStatusChange(student.id, val)}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Mark Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PRESENT">Present</SelectItem>
                                                    <SelectItem value="ABSENT">Absent</SelectItem>
                                                    <SelectItem value="LATE">Late</SelectItem>
                                                    <SelectItem value="EXCUSED">Excused</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {saving === student.id ? (
                                            <span className="text-xs text-zinc-400 animate-pulse">Saving...</span>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <Check className="h-4 w-4 text-zinc-300" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!sessionId && (
                <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 p-4 rounded-lg flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-400">No Session Selected</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-500">
                            Manual attendance marking is only available when a specific session is selected from your dashboard.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Minimal helper to fix missing Label import in the provided snippet
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <label className={`text-sm font-medium leading-none ${className}`}>{children}</label>;
}
