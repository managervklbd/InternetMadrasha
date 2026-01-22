
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getLessonsByBatch } from "@/lib/actions/lesson-actions";
import LessonManager from "./LessonManager"; // Import the client component
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
    params: Promise<{ batchId: string }>;
};

export default async function BatchLessonsPage({ params }: Props) {
    const { batchId } = await params; // Await params in Next.js 15
    const session = await auth();

    if (!session?.user || session.user.role !== "TEACHER") {
        return redirect("/");
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
                <Link href="/teacher/lessons">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold font-bengali">{batch.name} - লেসন</h1>
                    <p className="text-muted-foreground">{batch.department.name}</p>
                </div>
            </div>

            <LessonManager batchId={batchId} lessons={lessons} />
        </div>
    );
}
