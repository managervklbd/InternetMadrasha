"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Calendar,
    UserCheck,
    Edit,
    Trash2,
    Plus,
    Download
} from "lucide-react";
import {
    getAllTeachersAttendance,
    adminMarkTeacherAttendance,
    deleteTeacherAttendance
} from "@/lib/actions/teacher-attendance-actions";
import { toast } from "sonner";
import { exportToExcel, formatDateForExport, formatTimeForExport } from "@/lib/utils/export";

export default function AdminTeacherAttendancePage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllTeachersAttendance(new Date(selectedDate));
            setTeachers(data);
        } catch (error) {
            console.error(error);
            toast.error("তথ্য লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const handleMarkAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const checkInTime = formData.get("checkInTime") as string;
        const checkOutTime = formData.get("checkOutTime") as string;

        const data = {
            teacherId: editingTeacher.id,
            date: new Date(selectedDate),
            status: formData.get("status") as any,
            checkIn: checkInTime ? new Date(`${selectedDate}T${checkInTime}`) : undefined,
            checkOut: checkOutTime ? new Date(`${selectedDate}T${checkOutTime}`) : undefined,
            notes: formData.get("notes") as string,
        };

        try {
            await adminMarkTeacherAttendance(data);
            toast.success("হাজিরা সংরক্ষিত হয়েছে!");
            setModalOpen(false);
            setEditingTeacher(null);
            await loadData();
        } catch (error: any) {
            toast.error(error.message || "সংরক্ষণ ব্যর্থ হয়েছে।");
        }
    };

    const handleDelete = async (attendanceId: string) => {
        if (!confirm("আপনি কি নিশ্চিত এই রেকর্ডটি মুছে ফেলতে চান?")) return;

        try {
            await deleteTeacherAttendance(attendanceId);
            toast.success("রেকর্ড মুছে ফেলা হয়েছে!");
            await loadData();
        } catch (error: any) {
            toast.error(error.message || "মুছে ফেলা ব্যর্থ হয়েছে।");
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            PRESENT: { className: "bg-green-100 text-green-700 border-green-200", label: "উপস্থিত" },
            LATE: { className: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "বিলম্বে" },
            ABSENT: { className: "bg-red-100 text-red-700 border-red-200", label: "অনুপস্থিত" },
            HALF_DAY: { className: "bg-orange-100 text-orange-700 border-orange-200", label: "অর্ধদিবস" },
            LEAVE: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "ছুটি" },
            SICK_LEAVE: { className: "bg-purple-100 text-purple-700 border-purple-200", label: "অসুস্থতা ছুটি" },
        };
        const config = variants[status] || { className: "bg-gray-100 text-gray-700", label: "অচিহ্নিত" };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const handleExport = () => {
        if (teachers.length === 0) {
            toast.error("কোনো ডেটা নেই এক্সপোর্ট করার জন্য।");
            return;
        }

        const exportData = teachers.map(teacher => ({
            "নাম": teacher.fullName,
            "পদবী": teacher.designation || "-",
            "চেক-ইন": teacher.attendance?.checkIn ? formatTimeForExport(teacher.attendance.checkIn) : "-",
            "চেক-আউট": teacher.attendance?.checkOut ? formatTimeForExport(teacher.attendance.checkOut) : "-",
            "কর্মঘণ্টা": teacher.attendance?.workingHours ? teacher.attendance.workingHours.toFixed(2) : "-",
            "স্ট্যাটাস": teacher.attendance ? getStatusLabel(teacher.attendance.status) : "অচিহ্নিত",
            "নোট": teacher.attendance?.notes || "-"
        }));

        const filename = `teacher-attendance-${formatDateForExport(selectedDate)}`;
        exportToExcel(exportData, filename);
        toast.success("হাজিরা এক্সপোর্ট সফল হয়েছে!");
    };

    const getStatusLabel = (status: string) => {
        const labels: any = {
            PRESENT: "উপস্থিত",
            LATE: "বিলম্বে",
            ABSENT: "অনুপস্থিত",
            HALF_DAY: "অর্ধদিবস",
            LEAVE: "ছুটি",
            SICK_LEAVE: "অসুস্থতা ছুটি",
        };
        return labels[status] || "অচিহ্নিত";
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali">শিক্ষক হাজিরা ব্যবস্থাপনা</h1>
                    <p className="text-zinc-500 text-lg font-bengali">সকল শিক্ষকের উপস্থিতি রেকর্ড দেখুন এবং পরিচালনা করুন।</p>
                </div>
                <Button
                    onClick={handleExport}
                    disabled={loading || teachers.length === 0}
                    className="bg-green-600 hover:bg-green-700 gap-2 font-bengali"
                >
                    <Download className="w-4 h-4" />
                    Excel এ এক্সপোর্ট
                </Button>
            </div>

            {/* Date Selector */}
            <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <div className="flex-1 max-w-xs">
                            <Label htmlFor="date" className="font-bengali">তারিখ নির্বাচন করুন</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                        <div className="text-sm text-zinc-500 font-bengali">
                            মোট শিক্ষক: {teachers.length}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Teachers Table */}
            <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-bengali">
                        <UserCheck className="w-5 h-5 text-teal-600" />
                        শিক্ষকদের হাজিরা তালিকা
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                <TableRow>
                                    <TableHead className="font-bengali">নাম</TableHead>
                                    <TableHead className="font-bengali">পদবী</TableHead>
                                    <TableHead className="font-bengali">চেক-ইন</TableHead>
                                    <TableHead className="font-bengali">চেক-আউট</TableHead>
                                    <TableHead className="font-bengali">কর্মঘণ্টা</TableHead>
                                    <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                                    <TableHead className="text-right font-bengali">অ্যাকশন</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-zinc-500 font-bengali">
                                            লোড হচ্ছে...
                                        </TableCell>
                                    </TableRow>
                                ) : teachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-zinc-500 font-bengali">
                                            কোনো শিক্ষক পাওয়া যায়নি
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell className="font-semibold font-bengali">{teacher.fullName}</TableCell>
                                            <TableCell className="text-sm text-zinc-600 font-bengali">{teacher.designation}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {teacher.attendance?.checkIn
                                                    ? new Date(teacher.attendance.checkIn).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {teacher.attendance?.checkOut
                                                    ? new Date(teacher.attendance.checkOut).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {teacher.attendance?.workingHours
                                                    ? `${teacher.attendance.workingHours.toFixed(2)}h`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {teacher.attendance
                                                    ? getStatusBadge(teacher.attendance.status)
                                                    : <Badge variant="outline" className="font-bengali">অচিহ্নিত</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingTeacher(teacher);
                                                            setModalOpen(true);
                                                        }}
                                                        className="font-bengali"
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        {teacher.attendance ? "সম্পাদনা" : "যোগ করুন"}
                                                    </Button>
                                                    {teacher.attendance && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(teacher.attendance.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Mark/Edit Attendance Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleMarkAttendance}>
                        <DialogHeader>
                            <DialogTitle className="font-bengali">
                                {editingTeacher?.attendance ? "হাজিরা সম্পাদনা করুন" : "হাজিরা যোগ করুন"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="font-bengali">শিক্ষক</Label>
                                <Input value={editingTeacher?.fullName || ""} disabled className="mt-2 font-bengali" />
                            </div>
                            <div>
                                <Label htmlFor="status" className="font-bengali">স্ট্যাটাস</Label>
                                <Select name="status" defaultValue={editingTeacher?.attendance?.status || "PRESENT"}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRESENT" className="font-bengali">উপস্থিত</SelectItem>
                                        <SelectItem value="LATE" className="font-bengali">বিলম্বে</SelectItem>
                                        <SelectItem value="ABSENT" className="font-bengali">অনুপস্থিত</SelectItem>
                                        <SelectItem value="HALF_DAY" className="font-bengali">অর্ধদিবস</SelectItem>
                                        <SelectItem value="LEAVE" className="font-bengali">ছুটি</SelectItem>
                                        <SelectItem value="SICK_LEAVE" className="font-bengali">অসুস্থতা ছুটি</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="checkInTime" className="font-bengali">চেক-ইন সময়</Label>
                                    <Input
                                        id="checkInTime"
                                        name="checkInTime"
                                        type="time"
                                        defaultValue={editingTeacher?.attendance?.checkIn
                                            ? new Date(editingTeacher.attendance.checkIn).toTimeString().slice(0, 5)
                                            : "09:00"}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="checkOutTime" className="font-bengali">চেক-আউট সময়</Label>
                                    <Input
                                        id="checkOutTime"
                                        name="checkOutTime"
                                        type="time"
                                        defaultValue={editingTeacher?.attendance?.checkOut
                                            ? new Date(editingTeacher.attendance.checkOut).toTimeString().slice(0, 5)
                                            : ""}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notes" className="font-bengali">নোট (ঐচ্ছিক)</Label>
                                <Input
                                    id="notes"
                                    name="notes"
                                    defaultValue={editingTeacher?.attendance?.notes || ""}
                                    placeholder="কোনো মন্তব্য লিখুন..."
                                    className="mt-2 font-bengali"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="font-bengali">
                                বাতিল
                            </Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 font-bengali">
                                সংরক্ষণ করুন
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
