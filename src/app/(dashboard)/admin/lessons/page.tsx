
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { getBatches } from "@/lib/actions/academic-actions";

export default async function AdminLessonsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return redirect("/");
    }

    const allBatchesData = await getBatches();

    // Flatten batches
    const batches = allBatchesData.map((b: any) => ({
        ...b,
        courseName: b.department.course.name,
        deptName: b.department.name
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-bengali text-teal-900">লেসন ও রিসোর্স ব্যবস্থাপনা</h1>
                    <p className="text-muted-foreground">সকল ব্যাচের জন্য ভিডিও লেসন ও রিসোর্স ম্যানেজ করুন</p>
                </div>
                <Link href="/admin/academics">
                    <Button variant="outline" className="gap-2 font-bengali">
                        <Settings className="h-4 w-4" /> একাডেমিক সেটআপ
                    </Button>
                </Link>
            </div>

            {batches.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">কোনো ব্যাচ পাওয়া যায়নি</h3>
                        <p className="text-muted-foreground mt-2">প্রথমে একাডেমিক সেটআপ থেকে কোর্স ও ব্যাচ তৈরি করুন।</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <Card key={batch.id} className="hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                                        {batch.courseName}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 font-medium">
                                        {batch.allowedMode}
                                    </div>
                                </div>
                                <CardTitle className="font-bengali text-xl mt-2">{batch.name}</CardTitle>
                                <CardDescription className="text-xs">{batch.deptName}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/teacher/lessons/${batch.id}`} passHref>
                                    <Button className="w-full group bg-teal-600 hover:bg-teal-700 font-bengali">
                                        রিসোর্স ম্যানেজ করুন
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
