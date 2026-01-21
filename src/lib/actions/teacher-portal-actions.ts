"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AttendanceStatus } from "@prisma/client";

/**
 * Security helper to verify if the user is a teacher and get their profile ID.
 */
async function getTeacherProfile() {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }

    const profile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!profile) throw new Error("Teacher profile not found");
    return profile;
}

export async function getAssignedBatches() {
    const profile = await getTeacherProfile();
    return prisma.batch.findMany({
        where: {
            teachers: {
                some: { id: profile.id },
            },
            active: true,
        },
        include: {
            department: {
                include: { course: true },
            },
            _count: {
                select: { enrollments: true },
            },
            enrollments: {
                include: {
                    student: true
                }
            }
        },
    });
}

export async function getTeacherSessions() {
    const profile = await getTeacherProfile();
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    return prisma.classSession.findMany({
        where: {
            batch: {
                teachers: {
                    some: { id: profile.id },
                },
            },
            date: {
                gte: todayStart,
                lte: todayEnd,
            },
        },
        include: {
            batch: true,
        },
    });
}

export async function markOfflineAttendance(data: {
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
}) {
    await getTeacherProfile();

    // Verify student is offline student
    const student = await prisma.studentProfile.findUnique({
        where: { id: data.studentId },
    });

    if (!student || student.mode !== "OFFLINE") {
        throw new Error("Only offline student attendance can be manually marked.");
    }

    const joinTime = (data.status === "PRESENT" || data.status === "LATE") ? new Date() : null;

    return prisma.attendance.upsert({
        where: {
            studentId_classSessionId: {
                studentId: data.studentId,
                classSessionId: data.sessionId,
            },
        },
        update: {
            status: data.status,
            joinTime: joinTime
        },
        create: {
            studentId: data.studentId,
            classSessionId: data.sessionId,
            status: data.status,
            mode: "OFFLINE",
            joinTime: joinTime
        },
    });
}

export async function getSessionAttendance(sessionId: string) {
    await getTeacherProfile();
    return prisma.attendance.findMany({
        where: { classSessionId: sessionId }
    });
}
