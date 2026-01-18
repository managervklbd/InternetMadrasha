"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, PlayCircle, Lock } from "lucide-react";
import { getStudentLiveClasses, joinLiveClass } from "@/lib/actions/live-class-actions";

export default function StudentLiveClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshClasses = async () => {
        setLoading(true);
        try {
            const data = await getStudentLiveClasses();
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

    const handleJoin = async (classId: string, session: string) => {
        try {
            const link = await joinLiveClass(classId, session as any);
            window.open(link, "_blank");
        } catch (err: any) {
            alert(err.message || "Error joining class.");
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali text-teal-900 dark:text-teal-50">আমার লাইভ ক্লাস</h1>
                    <p className="text-zinc-500 text-lg font-bengali mt-1">এই মাসের জন্য আপনার নির্ধারিত লাইভ সেশনসমূহ।</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-amber-700 dark:text-amber-500 font-bold uppercase tracking-wider">বর্তমান মাস</p>
                        <p className="text-sm font-bengali font-bold text-amber-900 dark:text-amber-200">
                            {getMonthName(new Date().getMonth() + 1)}, {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-500 italic font-bengali">লোড হচ্ছে...</div>
            ) : classes.length === 0 ? (
                <Card className="border-dashed border-2 py-12 bg-white/50 dark:bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <Lock className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-xl font-bold font-bengali text-zinc-600 dark:text-zinc-400">কোন লাইভ ক্লাস পাওয়া যায়নি</h3>
                        <p className="max-w-md text-zinc-500 font-bengali mt-2 text-balance">
                            আপনার জন্য কোন লাইভ ক্লাস নির্ধারিত নেই অথবা আপনার বর্তমান মাসের পেমেন্ট বকেয়া রয়েছে।
                            পেমেন্ট পরিশোধ করা থাকলে অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-none shadow-xl bg-white dark:bg-zinc-950 group hover:ring-2 hover:ring-teal-500 transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-6">
                                <CardTitle className="font-bengali text-2xl mb-1">{item.title}</CardTitle>
                                <CardDescription className="text-teal-50 font-bengali opacity-90">{getMonthName(item.month)}, {item.year}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bengali font-bold uppercase tracking-wider">
                                        <Clock className="w-4 h-4" />
                                        <span>উপলব্ধ সেশনসমূহ</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {item.sessions.map((s: string) => (
                                            <div key={s} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600">
                                                        <Video className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bengali font-bold text-zinc-700 dark:text-zinc-300">
                                                        {s === "MORNING" ? "সকাল সেশন" : s === "NOON" ? "দুপুর সেশন" : "রাত সেশন"}
                                                    </span>
                                                </div>
                                                <Button
                                                    onClick={() => handleJoin(item.id, s)}
                                                    size="sm"
                                                    className="bg-teal-600 hover:bg-teal-700 font-bengali h-9 px-4 rounded-xl gap-2 shadow-sm"
                                                >
                                                    <PlayCircle className="w-4 h-4" />
                                                    যোগ দিন
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Live Now</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium uppercase tracking-widest italic">Attendance Auto-Logged</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
