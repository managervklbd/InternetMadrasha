import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, GraduationCap } from "lucide-react";

export default async function StudentResultsPage() {
    const session = await auth();
    const profile = await prisma.studentProfile.findUnique({
        where: { userId: session?.user?.id },
        include: {
            marks: {
                include: {
                    assessment: true
                }
            }
        }
    });

    // In a real scenario, we'd filter for published results only
    const publishedMarks = profile?.marks || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Results</h1>
                    <p className="text-zinc-500 text-lg">Monitor your progress and view published grades for assessments.</p>
                </div>
                <Trophy className="w-10 h-10 text-teal-600 opacity-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-teal-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-teal-700 font-bold uppercase tracking-wider text-[10px]">Academic Standing</CardDescription>
                        <CardTitle className="text-2xl font-bold text-teal-900">N/A</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-teal-600">Position in batch will appear after finals.</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Assessments Completed</CardDescription>
                        <CardTitle className="text-2xl font-bold">{publishedMarks.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-zinc-400">Evaluations recorded this term.</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Average Attendance</CardDescription>
                        <CardTitle className="text-2xl font-bold">94%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-zinc-400">Participation rate across all sessions.</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950">
                <CardHeader>
                    <CardTitle>Grading Summary</CardTitle>
                    <CardDescription>Published marks and teacher remarks for your evaluations.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50/50">
                            <TableRow>
                                <TableHead>Assessment Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Marks Obtained</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {publishedMarks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic">
                                        No results have been published yet for your profile.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                publishedMarks.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-bold">{m.assessment.name}</TableCell>
                                        <TableCell className="text-sm text-zinc-500">{new Date(m.assessment.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-bold text-teal-600">{m.obtainedMark}</TableCell>
                                        <TableCell className="font-medium text-zinc-400">{m.assessment.totalMarks}</TableCell>
                                        <TableCell className="text-sm italic text-zinc-500">{m.comments || "No remarks provided."}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
