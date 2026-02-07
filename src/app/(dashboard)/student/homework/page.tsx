import { getStudentHomeworks } from "@/lib/actions/student-portal-actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Clock,
    CheckCircle2,
    ArrowRight,
    Upload,
    History,
    Award,
    Lock
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function StudentHomeworkPage() {
    const { homeworks, isExamFeePaid } = await getStudentHomeworks();

    const submitted = homeworks.filter((hw: any) => hw.submissions.length > 0);
    const pending = homeworks.filter((hw: any) => hw.submissions.length === 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali">আমার হোমওয়ার্ক</h1>
                <p className="text-zinc-500 text-lg font-bengali">নতুন কাজ জমা দিন এবং পুরাতন কাজের ফলাফল দেখুন।</p>
                {!isExamFeePaid && homeworks.some((h: any) => h.type === "EXAM") && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        <span className="font-bengali">পরিক্ষায় অংশগ্রহণের জন্য অনুগ্রহ করে 'পরিক্ষা ফি' পরিশোধ করুন।</span>
                    </div>
                )}
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                    <TabsTrigger value="pending" className="font-bengali">জমা বাকি আছে ({pending.length})</TabsTrigger>
                    <TabsTrigger value="submitted" className="font-bengali">জমা দেওয়া হয়েছে ({submitted.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pending.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-zinc-500 italic font-bengali border rounded-xl bg-zinc-50/50">
                                আপনার কোনো হোমওয়ার্ক জমা বাকি নেই।
                            </div>
                        ) : (
                            pending.map((hw: any) => {
                                const isLocked = hw.type === "EXAM" && !isExamFeePaid;

                                return (
                                    <Card key={hw.id} className={`border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-teal-500/20 transition-all flex flex-col h-full ${isLocked ? 'opacity-75 bg-zinc-50' : ''}`}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="font-bengali text-[10px] bg-teal-50 text-teal-700">{hw.batch.name}</Badge>
                                                    {hw.type === "EXAM" && <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-bengali">পরিক্ষা</Badge>}
                                                </div>
                                                {new Date(hw.deadline) < new Date() ? (
                                                    <Badge variant="destructive" className="text-[10px] font-bengali">ডেডলাইন শেষ</Badge>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold font-bengali">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(hw.deadline).toLocaleDateString('bn-BD')}
                                                    </div>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg leading-tight font-bengali line-clamp-2 flex items-center gap-2">
                                                {hw.title}
                                                {isLocked && <Lock className="w-4 h-4 text-zinc-400" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                                            <p className="text-xs text-zinc-500 line-clamp-2 font-bengali">{hw.description}</p>
                                            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-zinc-100">
                                                {isLocked ? (
                                                    <div className="col-span-2 text-center text-xs text-red-500 font-medium font-bengali py-2 bg-red-50 rounded">
                                                        ফি পরিশোধ আবশ্যক
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Link href={`/student/homework/${hw.id}`} className="w-full">
                                                            <Button variant="outline" size="sm" className="w-full gap-2 text-xs h-9 font-bengali">
                                                                <FileText className="w-3.5 h-3.5" />
                                                                বিস্তারিত
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/student/homework/${hw.id}`} className="w-full">
                                                            <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-xs h-9 gap-2 font-bengali">
                                                                <Upload className="w-3.5 h-3.5" />
                                                                জমা দিন
                                                            </Button>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="submitted" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {submitted.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-zinc-500 italic font-bengali border rounded-xl bg-zinc-50/50">
                                আপনি এখনো কোনো হোমওয়ার্ক জমা দেননি।
                            </div>
                        ) : (
                            submitted.map((hw) => {
                                const submission = hw.submissions[0];
                                return (
                                    <Card key={hw.id} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-teal-500/20 transition-all flex flex-col h-full group">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline" className="font-bengali text-[10px]">{hw.batch.name}</Badge>
                                                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold font-bengali">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    জমা দেওয়া হয়েছে
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg leading-tight font-bengali group-hover:text-teal-600 transition-colors">{hw.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                                            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center justify-between text-xs mb-2">
                                                    <span className="text-zinc-500 font-bengali">জমার তারিখ:</span>
                                                    <span className="font-medium font-bengali">{new Date(submission.submittedAt).toLocaleDateString("bn-BD")}</span>
                                                </div>
                                                {submission.grade ? (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-zinc-500 font-bengali text-xs">ফলাফল:</span>
                                                        <Badge className="bg-green-600 hover:bg-green-700 font-bold text-xs gap-1">
                                                            <Award className="w-3 h-3" />
                                                            {submission.grade}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-xs text-amber-600 font-medium font-bengali bg-amber-50 px-2 py-1 rounded w-fit ml-auto">
                                                        <Clock className="w-3 h-3" />
                                                        রিভিউ পেন্ডিং
                                                    </div>
                                                )}
                                            </div>

                                            <Link href={`/student/homework/${hw.id}`} className="w-full mt-auto">
                                                <Button variant="secondary" size="sm" className="w-full gap-2 text-xs h-9 font-bengali bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200">
                                                    <History className="w-3.5 h-3.5" />
                                                    ফিডব্যাক দেখুন
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
