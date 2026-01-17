import { prisma } from "@/lib/db";
import { auth } from "@/auth";
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
    MessageSquare,
    ArrowRight,
    Upload
} from "lucide-react";
import Link from "next/link";

export default async function StudentHomeworkPage() {
    const session = await auth();
    const profile = await prisma.studentProfile.findUnique({
        where: { userId: session?.user?.id },
        include: {
            enrollments: {
                include: {
                    batch: {
                        include: {
                            homeworks: {
                                include: {
                                    submissions: {
                                        where: { studentId: "auto-resolved-by-context" } // placeholder
                                    }
                                },
                                orderBy: { deadline: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    });

    // Flat list of homeworks for student enrolled batches
    const homeworks = profile?.enrollments.flatMap(e => e.batch.homeworks) || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Assigned Homework</h1>
                <p className="text-zinc-500 text-lg">Keep track of your studies, submit assignments, and view teacher feedback.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeworks.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-zinc-500 italic">No homework has been assigned to your batches yet.</div>
                ) : (
                    homeworks.map((hw) => (
                        <Card key={hw.id} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-teal-500/20 transition-all flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">Batch: {profile?.enrollments[0]?.batch.name}</Badge>
                                    {new Date(hw.deadline) < new Date() ? (
                                        <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                                            <Clock className="w-3 h-3" />
                                            Due: {new Date(hw.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                <CardTitle className="mt-3 text-lg leading-tight">{hw.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs mt-1">{hw.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 italic text-[11px] text-zinc-400">
                                    <span>Review Status: Not Submitted</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Button variant="outline" size="sm" className="gap-2 text-xs h-9">
                                        <FileText className="w-3.5 h-3.5" />
                                        Details
                                    </Button>
                                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs h-9 gap-2">
                                        <Upload className="w-3.5 h-3.5" />
                                        Submit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
