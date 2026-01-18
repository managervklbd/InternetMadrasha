"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLiveClassAttendance } from "@/lib/actions/live-class-actions";

export function AttendanceListModal({
    open,
    onOpenChange,
    classId,
    className
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classId: string | null;
    className?: string;
}) {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && classId) {
            setLoading(true);
            getLiveClassAttendance(classId)
                .then(setAttendance)
                .finally(() => setLoading(false));
        }
    }, [open, classId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-950">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold font-bengali text-teal-900 dark:text-teal-50">
                        হাজিরা লিস্ট: {className}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableRow>
                                <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">ছাত্রের নাম</TableHead>
                                <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">সেশন</TableHead>
                                <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">তারিখ ও সময়</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-4 font-bengali text-zinc-500">লোড হচ্ছে...</TableCell></TableRow>
                            ) : attendance.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-8 font-bengali text-zinc-500 italic">কোন হাজিরা রেকর্ড পাওয়া যায়নি।</TableCell></TableRow>
                            ) : (
                                attendance.map((at) => (
                                    <TableRow key={at.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                        <TableCell className="font-bengali font-medium text-zinc-900 dark:text-zinc-100">{at.student?.fullName}</TableCell>
                                        <TableCell className="font-bengali uppercase text-xs text-zinc-700 dark:text-zinc-300">
                                            {at.session === "MORNING" ? "সকাল" : at.session === "NOON" ? "দুপুর" : "রাত"}
                                        </TableCell>
                                        <TableCell className="text-[10px] text-zinc-500 font-mono">
                                            {new Date(at.joinTime).toLocaleString('bn-BD', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
