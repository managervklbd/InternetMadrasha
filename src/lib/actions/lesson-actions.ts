"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ResourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { logAdminAction } from "@/lib/audit";

const CreateLessonSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    batchId: z.string().uuid("Invalid Batch ID"),
});

export const createLesson = createSafeAction(CreateLessonSchema, async (data) => {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    let lesson;

    if (session.user.role === "TEACHER") {
        const teacher = await prisma.teacherProfile.findUnique({
            where: { userId: session.user.id },
            include: { assignedBatches: true }
        });

        if (!teacher) throw new Error("Teacher profile not found");

        const isAssigned = teacher.assignedBatches.some(b => b.id === data.batchId);
        if (!isAssigned) {
            throw new Error("You are not assigned to this batch");
        }

        lesson = await prisma.lesson.create({
            data: {
                title: data.title,
                description: data.description,
                batchId: data.batchId,
                teacherId: teacher.id,
            },
        });
    } else {
        lesson = await prisma.lesson.create({
            data: {
                title: data.title,
                description: data.description,
                batchId: data.batchId,
                teacherId: null,
            },
        });
    }

    await logAdminAction("CREATE_LESSON", "Lesson", lesson.id, { title: data.title, batchId: data.batchId });

    revalidatePath(`/teacher/lessons/${data.batchId}`);
    revalidatePath(`/admin/academics`);
    return { success: true };
});

const AddResourceSchema = z.object({
    lessonId: z.string().uuid(),
    title: z.string().min(1, "Title is required"),
    type: z.nativeEnum(ResourceType),
    url: z.string().url("Invalid URL"),
});

export const addResourceToLesson = createSafeAction(AddResourceSchema, async (data) => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const resource = await prisma.lessonResource.create({
        data: {
            lessonId: data.lessonId,
            title: data.title,
            type: data.type,
            url: data.url
        }
    });

    // Revalidate path - we need to know the batch ID to revalidate the page.
    // We can fetch the lesson to get the batch ID.
    const lesson = await prisma.lesson.findUnique({
        where: { id: data.lessonId },
        select: { batchId: true, title: true }
    });

    if (lesson) {
        await logAdminAction("ADD_RESOURCE", "LessonResource", resource.id, {
            lessonTitle: lesson.title,
            resourceTitle: data.title
        });
        revalidatePath(`/teacher/lessons/${lesson.batchId}`);
        revalidatePath(`/student/lessons`);
    }

    return { success: true };
});

const DeleteLessonSchema = z.object({
    lessonId: z.string().uuid(),
});

export const deleteLesson = createSafeAction(DeleteLessonSchema, async (data) => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const lesson = await prisma.lesson.findUnique({
        where: { id: data.lessonId },
        select: { batchId: true, teacherId: true, title: true }
    });

    if (!lesson) throw new Error("Lesson not found");

    if (session.user.role === "TEACHER") {
        const teacher = await prisma.teacherProfile.findUnique({
            where: { userId: session.user.id }
        });
        if (!teacher || teacher.id !== lesson.teacherId) {
            throw new Error("You can only delete your own lessons");
        }
    } else if (session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.lesson.delete({
        where: { id: data.lessonId }
    });

    await logAdminAction("DELETE_LESSON", "Lesson", data.lessonId, { title: lesson.title });

    revalidatePath(`/teacher/lessons/${lesson.batchId}`);
    return { success: true };
});

const DeleteResourceSchema = z.object({
    resourceId: z.string().uuid(),
});

export const deleteResource = createSafeAction(DeleteResourceSchema, async (data) => {
    const resource = await prisma.lessonResource.findUnique({
        where: { id: data.resourceId },
        include: { lesson: true }
    });

    if (!resource) throw new Error("Resource not found");

    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // TODO: Add proper permission checks here similar to deleteLesson

    await prisma.lessonResource.delete({
        where: { id: data.resourceId }
    });

    await logAdminAction("DELETE_RESOURCE", "LessonResource", data.resourceId, { title: resource.title });

    revalidatePath(`/teacher/lessons/${resource.lesson.batchId}`);
    return { success: true };
});

export async function getLessonsByBatch(batchId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const lessons = await prisma.lesson.findMany({
        where: { batchId },
        include: {
            resources: true,
            teacher: {
                select: { fullName: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return lessons;
}

