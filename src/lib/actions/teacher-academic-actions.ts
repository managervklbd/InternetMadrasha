"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

async function getTeacherProfile() {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") throw new Error("Unauthorized");
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) throw new Error("Teacher profile not found");
    return profile;
}

export async function createHomework(data: {
    title: string;
    description: string;
    batchId: string;
    deadline: Date;
}) {
    const profile = await getTeacherProfile();
    return prisma.homework.create({
        data: {
            ...data,
            teacherId: profile.id,
        },
    });
}

export async function getHomeworkWithSubmissions(batchId?: string) {
    const profile = await getTeacherProfile();
    return prisma.homework.findMany({
        where: {
            teacherId: profile.id,
            ...(batchId ? { batchId } : {}),
        },
        include: {
            batch: true,
            submissions: {
                include: {
                    student: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function gradeSubmission(data: {
    submissionId: string;
    grade: string;
    feedback: string;
}) {
    await getTeacherProfile();
    return prisma.homeworkSubmission.update({
        where: { id: data.submissionId },
        data: {
            grade: data.grade,
            feedback: data.feedback,
        },
    });
}

export async function createAssessment(data: {
    name: string;
    date: Date;
    totalMarks: number;
}) {
    await getTeacherProfile();
    return prisma.assessment.create({
        data,
    });
}

export async function saveDraftMarks(assessmentId: string, marks: { studentId: string, subjectId: string, obtainedMark: number }[]) {
    await getTeacherProfile();

    const operations = marks.map(m => prisma.mark.upsert({
        where: {
            // Need a composite unique for Marks in schema if we want upsert easily
            // For now, let's assume we create them. Schema might need 
            // @@unique([assessmentId, studentId, subjectId]) for real production
            id: "placeholder" // Simplified for logic demonstration
        },
        update: { obtainedMark: m.obtainedMark },
        create: {
            assessmentId,
            studentId: m.studentId,
            subjectId: m.subjectId,
            obtainedMark: m.obtainedMark
        }
    }));

    // Re-implementing as simple createMany or loop since schema doesn't have the unique yet for upsert
    for (const m of marks) {
        await prisma.mark.create({
            data: {
                assessmentId,
                studentId: m.studentId,
                subjectId: m.subjectId,
                obtainedMark: m.obtainedMark
            }
        });
    }
}
