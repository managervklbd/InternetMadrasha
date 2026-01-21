"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    MoreVertical,
    Calendar,
    Users,
    Trash2,
    Edit
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getMonthlyLiveClasses, deleteMonthlyLiveClass } from "@/lib/actions/live-class-actions";
import { getSessionConfigs } from "@/lib/actions/session-config-actions";
import { MonthlyLiveClassModal } from "@/components/admin/live-classes/MonthlyLiveClassModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionConfigManager } from "@/components/admin/live-classes/SessionConfigManager";
import { AttendanceListModal } from "@/components/teacher/live-classes/AttendanceListModal";

export default function AdminLiveClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [sessionConfigs, setSessionConfigs] = useState<any[]>([]);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedAttendanceClassId, setSelectedAttendanceClassId] = useState<string | null>(null);

    const refreshClasses = async () => {
        setLoading(true);
        try {
            const data = await getMonthlyLiveClasses();
            setClasses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshClasses();
        getSessionConfigs().then(setSessionConfigs);
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("আপনি কি নিশ্চিত যে এই লাইভ ক্লাসটি ডিলিট করতে চান?")) {
            try {
                await deleteMonthlyLiveClass(id);
                refreshClasses();
            } catch (err) {
                alert("Error deleting class.");
            }
        }
    };

    const getMonthName = (month: number) => {
        const months = [
            "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
            "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
        ];
        return months[month - 1];
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali text-teal-900 dark:text-teal-50">লাইভ ক্লাস ব্যবস্থাপনা</h1>
                    <p className="text-zinc-500 text-lg font-bengali mt-1">অ্যাডমিন কর্তৃক মাসিক লাইভ ক্লাস তৈরি এবং শিক্ষক অ্যাসাইন করুন।</p>
                </div>
            </div>

            <Tabs defaultValue="classes" className="w-full">
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="classes" className="font-bengali">লাইভ ক্লাসসমূহ</TabsTrigger>
                    <TabsTrigger value="settings" className="font-bengali">সেটিংস / কনফিগারেশন</TabsTrigger>
                </TabsList>

                <TabsContent value="classes" className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            onClick={() => {
                                setSelectedClass(null);
                                setIsCreateModalOpen(true);
                            }}
                            className="gap-2 bg-teal-600 hover:bg-teal-700 h-11 px-6 shadow-sm ring-1 ring-teal-600/20 font-bengali"
                        >
                            <Plus className="w-5 h-5" />
                            নতুন মাসিক ক্লাস যোগ করুন
                        </Button>
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableRow>
                                    <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">শিরোনাম</TableHead>
                                    <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">মাস ও বছর</TableHead>
                                    <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">জেন্ডার</TableHead>
                                    <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">শিক্ষক</TableHead>
                                    <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">সেশনসমূহ</TableHead>
                                    <TableHead className="font-bengali text-zinc-900 dark:text-zinc-100">স্ট্যাটাস</TableHead>
                                    <TableHead className="text-right font-bengali text-zinc-900 dark:text-zinc-100">অ্যাকশন</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-zinc-500 italic font-bengali">
                                            লাইভ ক্লাসের তথ্য লোড হচ্ছে...
                                        </TableCell>
                                    </TableRow>
                                ) : classes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-zinc-500 italic font-bengali">
                                            কোন লাইভ ক্লাস পাওয়া যায়নি।
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    classes.map((item) => (
                                        <TableRow key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-bengali">{item.title}</span>
                                                    <span className="text-[10px] text-zinc-500 font-bengali">
                                                        {item.batch?.department?.course?.name} / {item.batch?.department?.name}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-emerald-600 font-bengali">{item.batch?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                                    <span className="text-sm font-bengali">{getMonthName(item.month)}, {item.year}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.gender === "MALE" ? "outline" : "secondary"} className="font-bengali">
                                                    {item.gender === "MALE" ? "পুরুষ" : "মহিলা"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-teal-600" />
                                                    <span className="text-sm font-medium">{item.teacher?.fullName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {item.sessionKeys ? (
                                                        item.sessionKeys.map((s: string) => {
                                                            const config = sessionConfigs.find(c => c.key === s);
                                                            return (
                                                                <div key={s} className="flex flex-col mb-1 last:mb-0">
                                                                    <Badge variant="outline" className="text-[10px] uppercase font-bengali w-fit">
                                                                        {config?.label || s}
                                                                    </Badge>
                                                                    {config && (
                                                                        <span className="text-[9px] text-zinc-500 font-mono pl-1">
                                                                            {config.startTime}-{config.endTime}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        item.sessions?.map((s: string) => (
                                                            <Badge key={s} variant="outline" className="text-[10px] uppercase font-bengali">
                                                                {s === "MORNING" ? "সকাল" : s === "NOON" ? "দুপুর" : "রাত"}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.active ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 font-bengali">সক্রিয়</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 font-bengali">নিষ্ক্রিয়</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedAttendanceClassId(item.id);
                                                                setIsAttendanceModalOpen(true);
                                                            }}
                                                            className="font-bengali cursor-pointer"
                                                        >
                                                            <Users className="w-4 h-4 mr-2" />
                                                            হাজিরা দেখুন
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedClass(item);
                                                                setIsCreateModalOpen(true);
                                                            }}
                                                            className="font-bengali cursor-pointer"
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            সম্পাদনা করুন
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-red-500 font-bengali cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            ডিলিট করুন
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <SessionConfigManager />
                </TabsContent>
            </Tabs>

            <MonthlyLiveClassModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={refreshClasses}
                initialData={selectedClass}
            />

            <AttendanceListModal
                open={isAttendanceModalOpen}
                onOpenChange={setIsAttendanceModalOpen}
                classId={selectedAttendanceClassId}
                className={classes.find(c => c.id === selectedAttendanceClassId)?.title}
            />
        </div>
    );
}
