"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getTeachers } from "@/lib/actions/teacher-actions";
import { getAcademicStructure } from "@/lib/actions/academic-actions";
import { createMonthlyLiveClass, updateMonthlyLiveClass } from "@/lib/actions/live-class-actions";
import { getSessionConfigs } from "@/lib/actions/session-config-actions";

export function MonthlyLiveClassModal({
    open,
    onOpenChange,
    onSuccess,
    initialData
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: any;
}) {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionConfigs, setSessionConfigs] = useState<any[]>([]);
    // Support both new sessionKeys and legacy sessions (mapped if possible, or just default empty)
    const [selectedSessions, setSelectedSessions] = useState<string[]>(initialData?.sessionKeys || initialData?.sessions || []);

    useEffect(() => {
        if (open) {
            getTeachers().then(setTeachers);
            getAcademicStructure().then(data => {
                const allBatches = data.flatMap(course =>
                    course.departments.flatMap(dept => dept.batches)
                );
                setBatches(allBatches);
            });
            getSessionConfigs().then(setSessionConfigs);

            if (initialData) {
                setSelectedSessions(initialData.sessionKeys || initialData.sessions || []);
            } else {
                setSelectedSessions([]);
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title") as string,
            month: parseInt(formData.get("month") as string),
            year: parseInt(formData.get("year") as string),
            gender: formData.get("gender") as any,
            teacherId: formData.get("teacherId") as string,
            batchId: formData.get("batchId") as string,
            sessionKeys: selectedSessions,
            liveLink: formData.get("liveLink") as string,
            active: formData.get("active") === "on",
        };

        try {
            if (initialData) {
                await updateMonthlyLiveClass(initialData.id, data);
            } else {
                await createMonthlyLiveClass(data as any);
            }
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            alert("Error saving live class. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSession = (session: string) => {
        setSelectedSessions(prev =>
            prev.includes(session) ? prev.filter(s => s !== session) : [...prev, session]
        );
    };

    const months = [
        { value: 1, label: "জানুয়ারি" },
        { value: 2, label: "ফেব্রুয়ারি" },
        { value: 3, label: "মার্চ" },
        { value: 4, label: "এপ্রিল" },
        { value: 5, label: "মে" },
        { value: 6, label: "জুন" },
        { value: 7, label: "জুলাই" },
        { value: 8, label: "আগস্ট" },
        { value: 9, label: "সেপ্টেম্বর" },
        { value: 10, label: "অক্টোবর" },
        { value: 11, label: "নভেম্বর" },
        { value: 12, label: "ডিসেম্বর" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-bengali">
                            {initialData ? "লাইভ ক্লাস সম্পাদনা করুন" : "নতুন মাসিক লাইভ ক্লাস তৈরি করুন"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-bengali text-zinc-900 dark:text-zinc-100">ক্লাসের শিরোনাম</Label>
                            <Input id="title" name="title" placeholder="যেমন: জানুয়ারি ২০২৬ - লাইভ ক্লাসেস" defaultValue={initialData?.title} required className="font-bengali" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bengali text-zinc-900 dark:text-zinc-100">মাস</Label>
                                <Select name="month" defaultValue={initialData?.month?.toString()}>
                                    <SelectTrigger className="bg-white dark:bg-zinc-950 font-bengali"><SelectValue placeholder="মাস নির্বাচন করুন" /></SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => <SelectItem key={m.value} value={m.value.toString()} className="font-bengali">{m.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bengali text-zinc-900 dark:text-zinc-100">বছর</Label>
                                <Input name="year" type="number" defaultValue={initialData?.year || new Date().getFullYear()} required className="bg-white dark:bg-zinc-950" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bengali text-zinc-900 dark:text-zinc-100">জেন্ডার</Label>
                                <Select name="gender" defaultValue={initialData?.gender}>
                                    <SelectTrigger className="bg-white dark:bg-zinc-950 font-bengali"><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE" className="font-bengali">পুরুষ (Male)</SelectItem>
                                        <SelectItem value="FEMALE" className="font-bengali">মহিলা (Female)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bengali text-zinc-900 dark:text-zinc-100">শিক্ষক</Label>
                                <Select name="teacherId" defaultValue={initialData?.teacherId}>
                                    <SelectTrigger className="bg-white dark:bg-zinc-950 font-bengali"><SelectValue placeholder="শিক্ষক নির্বাচন করুন" /></SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.id} className="font-bengali">{t.fullName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bengali text-zinc-900 dark:text-zinc-100">ব্যাচ / মারহালা</Label>
                            <Select name="batchId" defaultValue={initialData?.batchId}>
                                <SelectTrigger className="bg-white dark:bg-zinc-950 font-bengali"><SelectValue placeholder="ব্যাচ নির্বাচন করুন" /></SelectTrigger>
                                <SelectContent>
                                    {batches.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="font-bengali">
                                            {b.department?.course?.name} - {b.department?.name} ({b.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bengali text-zinc-900 dark:text-zinc-100">সেশন শিডিউল</Label>
                            <div className="flex flex-wrap gap-4">
                                {sessionConfigs.map((session: any) => (
                                    <div key={session.key} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`session-${session.key}`}
                                            checked={selectedSessions.includes(session.key)}
                                            onCheckedChange={() => toggleSession(session.key)}
                                        />
                                        <div className="flex flex-col">
                                            <Label htmlFor={`session-${session.key}`} className="font-bengali text-sm capitalize">
                                                {session.label}
                                            </Label>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {session.startTime} - {session.endTime}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {sessionConfigs.length === 0 && !loading && (
                                <p className="text-sm text-red-500 font-bengali">কোন সেশন কনফিগারেশন পাওয়া যায়নি। সেটিংস ট্যাবে গিয়ে সেশন তৈরি করুন।</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="liveLink" className="font-bengali text-zinc-900 dark:text-zinc-100">লাইভ ক্লাস লিঙ্ক (Zoom/Meet)</Label>
                            <Input id="liveLink" name="liveLink" placeholder="https://..." defaultValue={initialData?.liveLink} required className="bg-white dark:bg-zinc-950" />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="active" name="active" defaultChecked={initialData ? initialData.active : true} />
                            <Label htmlFor="active" className="font-bengali text-zinc-900 dark:text-zinc-100">সক্রিয় স্ট্যাটাস</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-bengali">বাতিল</Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 font-bengali" disabled={loading}>
                            {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
