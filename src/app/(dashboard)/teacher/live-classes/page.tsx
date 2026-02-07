"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, ExternalLink, Users } from "lucide-react";
import { getTeacherLiveClasses, joinLiveClassAsTeacher } from "@/lib/actions/live-class-actions";
import { AttendanceListModal } from "@/components/teacher/live-classes/AttendanceListModal";

export default function TeacherLiveClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedClassName, setSelectedClassName] = useState<string>("");

    const refreshClasses = async () => {
        setLoading(true);
        try {
            const data = await getTeacherLiveClasses();
            setClasses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshClasses();
    }, []);

    const getMonthName = (month: number) => {
        const months = [
            "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
            "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
        ];
        return months[month - 1];
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali text-teal-900 dark:text-teal-50">আমার লাইভ ক্লাস</h1>
                <p className="text-zinc-500 text-lg font-bengali mt-1">অ্যাডমিন কর্তৃক আপনার জন্য নির্ধারিত মাসিক লাইভ ক্লাসসমূহ।</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-500 italic font-bengali">লোড হচ্ছে...</div>
            ) : classes.length === 0 ? (
                <Card className="border-dashed border-2 py-12 bg-white/50 dark:bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <Video className="w-12 h-12 text-zinc-300 mb-4" />
                        <h3 className="text-xl font-bold font-bengali text-zinc-600 dark:text-zinc-400">কোন ক্লাস নির্ধারিত নেই</h3>
                        <p className="text-zinc-500 font-bengali mt-1">এই মাসের জন্য আপনার কোন লাইভ ক্লাস সেট করা হয়নি।</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-t-4 border-t-teal-600 shadow-md bg-white dark:bg-zinc-950">
                            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                <CardTitle className="font-bengali text-xl text-teal-900 dark:text-teal-50">{item.title}</CardTitle>
                                <CardDescription className="font-bengali">{item.batch?.name}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-teal-600" />
                                    <span className="font-bengali font-medium text-zinc-700 dark:text-zinc-300">{getMonthName(item.month)}, {item.year}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-bengali">
                                        <Clock className="w-4 h-4" />
                                        <span>সেশনসমূহ:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.sessionDetails && item.sessionDetails.length > 0 ? (
                                            item.sessionDetails.map((s: any) => (
                                                <div key={s.key} className="flex flex-col">
                                                    <Badge variant="secondary" className="font-bengali uppercase">
                                                        {s.label}
                                                    </Badge>
                                                    <span className="text-[9px] text-zinc-500 font-mono pl-1">
                                                        {s.startTime}-{s.endTime}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            item.sessions?.map((s: string) => (
                                                <Badge key={s} variant="secondary" className="font-bengali uppercase">
                                                    {s === "MORNING" ? "সকাল" : s === "NOON" ? "দুপুর" : "রাত"}
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <Button
                                        onClick={async () => {
                                            try {
                                                // Identify current session? 
                                                // For teachers, maybe we just pass the first active session key or none?
                                                // The action handles optional sessionKey.
                                                // Let's try to find if there's an active session now
                                                const now = new Date();
                                                const currentTime = now.getHours() * 60 + now.getMinutes();
                                                const activeSession = item.sessionDetails?.find((s: any) => {
                                                    const [startH, startM] = s.startTime.split(':').map(Number);
                                                    const [endH, endM] = s.endTime.split(':').map(Number);
                                                    const start = startH * 60 + startM;
                                                    const end = endH * 60 + endM;
                                                    return currentTime >= start && currentTime <= end;
                                                });

                                                const link = await joinLiveClassAsTeacher(item.id, activeSession?.key);
                                                window.open(link, "_blank");
                                            } catch (err: any) {
                                                alert(err.message || "Error joining class");
                                            }
                                        }}
                                        className="w-full bg-teal-600 hover:bg-teal-700 font-bengali gap-2 shadow-lg hover:shadow-teal-600/20"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        ক্লাসে যোগ দিন (Host)
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedClassId(item.id);
                                            setSelectedClassName(item.title);
                                            setAttendanceModalOpen(true);
                                        }}
                                        className="w-full font-bengali gap-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                    >
                                        <Users className="w-4 h-4" />
                                        ছাত্র হাজিরার তালিকা
                                    </Button>

                                    <p className="text-[10px] text-zinc-400 mt-3 text-center uppercase tracking-widest font-medium">Read-only Configuration</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AttendanceListModal
                open={attendanceModalOpen}
                onOpenChange={setAttendanceModalOpen}
                classId={selectedClassId}
                className={selectedClassName}
            />
        </div>
    );
}
