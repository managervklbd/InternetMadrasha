
import { getHomeworkById, gradeSubmission } from "@/lib/actions/teacher-academic-actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Clock,
    CheckCircle2,
    Calendar,
    ArrowLeft,
    User,
    Award
} from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function HomeworkReviewPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = await paramsPromise;
    const homework = await getHomeworkById(params.id);

    if (!homework) {
        return <div className="p-10 text-center font-bengali">অ্যাসাইনমেন্ট পাওয়া যায়নি।</div>;
    }

    async function handleGrade(formData: FormData) {
        "use server";
        const submissionId = formData.get("submissionId") as string;
        const grade = formData.get("grade") as string;
        const feedback = formData.get("feedback") as string;

        await gradeSubmission({
            submissionId,
            grade,
            feedback
        });
        revalidatePath(`/teacher/homework/${params.id}`);
    }

    return (
        <div className="space-y-8">
            <Link href="/teacher/homework" className="flex items-center gap-2 text-zinc-500 hover:text-teal-600 transition-colors w-fit group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bengali text-sm underline-offset-4 group-hover:underline">অ্যাসাইনমেন্ট তালিকায় ফিরে যান</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Homework Details */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 lg:col-span-1 h-fit">
                    <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2 font-bengali">{homework.batch.name}</Badge>
                        <CardTitle className="font-bengali text-xl">{homework.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium font-bengali mt-1">
                            <Clock className="w-4 h-4" />
                            শেষ সময়: {new Date(homework.deadline).toLocaleDateString("bn-BD")}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl text-sm font-bengali whitespace-pre-wrap">
                            {homework.description}
                        </div>
                        <div className="flex items-center justify-between text-sm font-medium pt-4 border-t border-zinc-100 font-bengali">
                            <span>মোট জমা পড়েছে:</span>
                            <Badge variant="outline">{homework.submissions.length} টি</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold font-bengali flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-teal-600" />
                        শিক্ষার্থীদের জমা দেওয়া কাজ
                    </h3>

                    {homework.submissions.length === 0 ? (
                        <Card className="border-none ring-1 ring-zinc-200 bg-zinc-50/50">
                            <CardContent className="py-20 text-center text-zinc-500 italic font-bengali">
                                এখনো কোনো শিক্ষার্থী জমা দেয়নি।
                            </CardContent>
                        </Card>
                    ) : (
                        homework.submissions.map((sub) => (
                            <Card key={sub.id} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold uppercase shrink-0">
                                            {sub.student.fullName?.[0] || <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bengali">{sub.student.fullName || "শিক্ষার্থী"}</CardTitle>
                                            <CardDescription className="font-bengali text-xs mt-1">
                                                জমা দিয়েছে: {new Date(sub.submittedAt).toLocaleString("bn-BD", { dateStyle: 'long', timeStyle: 'short' })}
                                                {new Date(sub.submittedAt) > new Date(homework.deadline) && (
                                                    <Badge variant="destructive" className="ml-2 text-[10px] py-0">Late</Badge>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {sub.grade && (
                                        <Badge className="bg-green-600 hover:bg-green-700 font-bold font-bengali flex items-center gap-1">
                                            <Award className="w-3 h-3" /> গ্রেড: {sub.grade}
                                        </Badge>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl space-y-4">
                                        <p className="font-bengali text-sm whitespace-pre-wrap">{sub.content}</p>

                                        {sub.fileUrls && sub.fileUrls.length > 0 && (
                                            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                                <p className="text-xs font-bold text-zinc-500 mb-2 font-bengali">সংযুক্ত ফাইল:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {sub.fileUrls.map((url, i) => (
                                                        <a
                                                            key={i}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:text-teal-600 hover:border-teal-200 transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            ফাইল {i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <form action={handleGrade} className="pt-4 border-t border-zinc-100 space-y-3">
                                        <input type="hidden" name="submissionId" value={sub.id} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bengali">গ্রেড / মার্কস</Label>
                                                <Input
                                                    name="grade"
                                                    defaultValue={sub.grade || ""}
                                                    placeholder="A+, 80/100, Excellent..."
                                                    className="h-9 font-bengali"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bengali">ফিডব্যাক (ঐচ্ছিক)</Label>
                                                <Input
                                                    name="feedback"
                                                    defaultValue={sub.feedback || ""}
                                                    placeholder="ভাল হয়েছে, আরো উন্নতি প্রয়োজন..."
                                                    className="h-9 font-bengali"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" size="sm" variant="outline" className="font-bengali hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200">
                                                আপডেট করুন
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
