
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getLessonsByBatch } from "@/lib/actions/lesson-actions";
import StudentLessonList from "./StudentLessonList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
    params: Promise<{ batchId: string }>;
};

export default async function StudentBatchLessonsPage({ params }: Props) {
    const { batchId } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "STUDENT") {
        return redirect("/");
    }

    // Security Check: Is student enrolled in this batch?
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_batchId: {
                studentId: session.user.id, // NOTE: Enrolment uses student profile ID, not user ID. We need to fetch student profile ID first.
                batchId: batchId
            }
        }
    });

    // Better way: Check via profile lookup from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            enrollments: {
                where: { batchId: batchId }
            }
        }
    });

    if (!studentProfile || studentProfile.enrollments.length === 0) {
        return <div className="p-8 text-destructive">You are not enrolled in this batch.</div>;
    }

    const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        select: { name: true, department: { select: { name: true } } }
    });

    if (!batch) return <div>ব্যাচ পাওয়া যায়নি</div>;

    const lessons = await getLessonsByBatch(batchId);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/student/lessons">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold font-bengali">{batch.name} - লেসন</h1>
                    <p className="text-muted-foreground">{batch.department.name}</p>
                </div>
            </div>

            <StudentLessonList lessons={lessons} />
        </div>
    );
}
