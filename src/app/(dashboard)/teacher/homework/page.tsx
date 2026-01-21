"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Plus,
    FileText,
    Users,
    Clock,
    CheckCircle2,
    Calendar,
    MessageSquare
} from "lucide-react";
import { getAssignedBatches } from "@/lib/actions/teacher-portal-actions";
import {
    createHomework,
    getHomeworkWithSubmissions
} from "@/lib/actions/teacher-academic-actions";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

export default function HomeworkPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [b, h] = await Promise.all([
                getAssignedBatches(),
                getHomeworkWithSubmissions()
            ]);
            setBatches(b);
            setHomeworks(h);
        } catch (err) {
            console.error(err);
            toast.error("তথ্য লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleCreateHomework = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            batchId: formData.get("batchId") as string,
            deadline: new Date(formData.get("deadline") as string),
        };

        try {
            await createHomework(data);
            toast.success("নতুন হোমওয়ার্ক তৈরি হয়েছে!");
            refreshData();
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            toast.error("হোমওয়ার্ক তৈরি করতে ব্যর্থ হয়েছে।");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali">অ্যাসাইনমেন্ট ল্যাব</h1>
                <p className="text-zinc-500 text-lg font-bengali">ছাত্রদের জন্য হোমওয়ার্ক তৈরি করুন এবং তাদের জমা দেওয়া কাজগুলো মূল্যায়ন করুন।</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Homework Form */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 h-fit lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-bengali">নতুন হোমওয়ার্ক দিন</CardTitle>
                        <CardDescription className="font-bengali">ব্যাচের জন্য নতুন অ্যাসাইনমেন্ট প্রকাশ করতে তথ্য দিন।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateHomework} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="batchId" className="font-bengali">ব্যাচ নির্বাচন করুন</Label>
                                <Select name="batchId" required>
                                    <SelectTrigger className="h-11 font-bengali">
                                        <SelectValue placeholder="ব্যাচ পছন্দ করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id} className="font-bengali">
                                                {b.name} ({b.allowedMode === "ONLINE" ? "অনলাইন" : "অফলাইন"})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-bengali">হেডলাইন / শিরোনাম</Label>
                                <Input id="title" name="title" placeholder="উদা: আরবি গ্রামার বেসিকস" required className="font-bengali" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-bengali">নির্দেশনা</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="w-full min-h-[100px] p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-bengali"
                                    placeholder="শিক্ষার্থীদের কী করতে হবে তা বিস্তারিত লিখুন..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadline" className="font-bengali">জমাদানের শেষ সময়</Label>
                                <Input id="deadline" name="deadline" type="datetime-local" required />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-11 font-bengali">
                                <Plus className="w-4 h-4 mr-2" />
                                হোমওয়ার্ক পাবলিশ করুন
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Homework List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 font-bengali">
                        <FileText className="w-5 h-5 text-teal-600" />
                        সাম্প্রতিক অ্যাসাইনমেন্টসমূহ
                    </h3>

                    {loading ? (
                        <div className="text-center py-20 text-zinc-500 italic font-bengali">ক্লাসরুম ডেটা সিঙ্ক হচ্ছে...</div>
                    ) : homeworks.length === 0 ? (
                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50/50">
                            <CardContent className="py-20 text-center text-zinc-500 italic font-bengali">
                                এখনো কোনো হোমওয়ার্ক দেওয়া হয়নি।
                            </CardContent>
                        </Card>
                    ) : (
                        homeworks.map((hw) => (
                            <Card key={hw.id} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-teal-500/20 transition-all cursor-pointer group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs uppercase tracking-wider font-bengali">{hw.batch.name}</Badge>
                                        <div className="flex items-center gap-1 text-xs text-zinc-400 font-bengali">
                                            <Calendar className="w-3 h-3" />
                                            শেষ সময়: {new Date(hw.deadline).toLocaleDateString("bn-BD")}
                                        </div>
                                    </div>
                                    <CardTitle className="mt-2 text-xl group-hover:text-teal-600 transition-colors font-bengali">{hw.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-zinc-400" />
                                            <span className="text-sm font-medium font-bengali">{hw.submissions.length} টি জমা পড়েছে</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium font-bengali">8 জন করা হয়েছে</span> {/* Placeholder */}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                                        <Button variant="ghost" size="sm" className="gap-2 font-bengali">
                                            <MessageSquare className="w-4 h-4" />
                                            রিভিউ করুন
                                        </Button>
                                        <Link href={`/teacher/homework/${hw.id}`}>
                                            <Button variant="secondary" size="sm" className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200 font-bengali">
                                                জমা হওয়া ফাইলসমূহ
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
