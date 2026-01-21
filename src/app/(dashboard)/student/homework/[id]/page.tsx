import { getHomeworkDetail } from "@/lib/actions/student-portal-actions";
import HomeworkSubmissionForm from "@/components/student/homework/HomeworkSubmissionForm";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Clock,
    CheckCircle2,
    ArrowLeft,
    Upload
} from "lucide-react";
import Link from "next/link";

export default async function HomeworkDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = await paramsPromise;
    const homework = await getHomeworkDetail(params.id);
    const submission = homework.submissions?.[0];
    const isOverdue = new Date(homework.deadline) < new Date() && !submission;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/student/homework" className="flex items-center gap-2 text-zinc-500 hover:text-teal-600 transition-colors w-fit group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bengali text-sm underline-offset-4 group-hover:underline">হোমওয়ার্ক তালিকায় ফিরে যান</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant="secondary" className="font-bengali bg-teal-50 text-teal-700 hover:bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400">
                                    {homework.batch.name}
                                </Badge>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight ${isOverdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-zinc-50 text-zinc-500 border border-zinc-100'}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="font-bengali">ডেডলাইন: {new Date(homework.deadline).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold font-bengali">{homework.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <p className="font-bengali text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {homework.description}
                                </p>
                            </div>

                            {homework.attachments.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-bold font-bengali text-sm text-zinc-500 uppercase">সংযুক্ত ফাইলসমূহ</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {homework.attachments.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-zinc-400 group-hover:text-teal-600 transition-colors" />
                                                </div>
                                                <span className="text-xs font-medium truncate">ফাইল {i + 1}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Submission Section */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader>
                            <CardTitle className="font-bengali flex items-center gap-2">
                                <Upload className="w-5 h-5 text-teal-600" />
                                আপনার সমাধান
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {submission ? (
                                <div className="space-y-6">
                                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 p-4 rounded-xl flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="font-bold text-green-900 dark:text-green-400 font-bengali text-sm">জমা দেওয়া হয়েছে</h5>
                                            <p className="text-[11px] text-green-700 dark:text-green-500 font-bengali">{new Date(submission.submittedAt).toLocaleString('bn-BD')}</p>
                                            {new Date(submission.submittedAt) > new Date(homework.deadline) && (
                                                <Badge variant="outline" className="mt-1 text-[9px] border-amber-200 text-amber-600 bg-amber-50">বিলম্বিত জমা (Late Submission)</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-bengali bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl italic border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                            "{submission.content}"
                                        </p>

                                        {submission.fileUrls && submission.fileUrls.length > 0 && (
                                            <div className="space-y-2">
                                                <h6 className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter ml-1">জমা দেওয়া ফাইলসমূহ</h6>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {submission.fileUrls.map((url: string, i: number) => (
                                                        <a
                                                            key={i}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="aspect-square rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors group overflow-hidden"
                                                        >
                                                            {url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                                <img src={url} alt={`File ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                            ) : (
                                                                <FileText className="w-6 h-6 text-zinc-300 group-hover:text-teal-600 transition-colors" />
                                                            )}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {submission.grade && (
                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-bold font-bengali text-sm">ওস্তাদের ফিডব্যাক</h5>
                                                <Badge className="bg-teal-600 font-bold">{submission.grade}</Badge>
                                            </div>
                                            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-sm font-bengali">
                                                {submission.feedback || "কোনো ফিডব্যাক দেওয়া হয়নি।"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <HomeworkSubmissionForm homeworkId={params.id} isOverdue={isOverdue} />
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats/Teacher Info */}
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-teal-600 text-white">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-xl font-bold uppercase">{homework.teacher.fullName[0]}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-teal-100 uppercase tracking-wider font-bold">ওস্তাদ</p>
                                    <h4 className="font-bold font-bengali text-sm">{homework.teacher.fullName}</h4>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
