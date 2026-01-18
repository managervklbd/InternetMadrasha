"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Gender, LiveClassSession } from "@prisma/client";

export async function getMonthlyLiveClasses() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return prisma.monthlyLiveClass.findMany({
        include: {
            teacher: true,
            batch: {
                include: {
                    department: {
                        include: {
                            course: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { year: 'desc' },
            { month: 'desc' }
        ]
    });
}

export async function createMonthlyLiveClass(data: {
    title: string;
    month: number;
    year: number;
    gender: Gender;
    teacherId: string;
    batchId: string;
    sessions: LiveClassSession[];
    liveLink: string;
    active: boolean;
}) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const result = await prisma.monthlyLiveClass.create({
        data
    });

    revalidatePath("/admin/live-classes");
    return result;
}

export async function updateMonthlyLiveClass(id: string, data: any) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const result = await prisma.monthlyLiveClass.update({
        where: { id },
        data
    });

    revalidatePath("/admin/live-classes");
    return result;
}

export async function deleteMonthlyLiveClass(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.monthlyLiveClass.delete({
        where: { id }
    });

    revalidatePath("/admin/live-classes");
}

export async function getTeacherLiveClasses() {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!teacher) throw new Error("Teacher profile not found");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return prisma.monthlyLiveClass.findMany({
        where: {
            teacherId: teacher.id,
            month: currentMonth,
            year: currentYear,
            active: true
        },
        include: {
            batch: true
        }
    });
}

export async function getStudentLiveClasses() {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") {
        throw new Error("Unauthorized");
    }

    const student = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            enrollments: true
        }
    });

    if (!student) throw new Error("Student profile not found");
    if (student.mode !== "ONLINE") return [];

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check payment for the current month
    const invoice = await prisma.monthlyInvoice.findUnique({
        where: {
            studentId_month_year: {
                studentId: student.id,
                month: currentMonth,
                year: currentYear
            }
        }
    });

    // CRITICAL: Strict payment enforcement
    if (invoice?.status !== "PAID") return [];

    const batchIds = student.enrollments.map(e => e.batchId);

    return prisma.monthlyLiveClass.findMany({
        where: {
            batchId: { in: batchIds },
            gender: student.gender,
            month: currentMonth,
            year: currentYear,
            active: true
        }
    });
}

export async function joinLiveClass(classId: string, sessionType: LiveClassSession) {
    const sessionUser = await auth();
    if (!sessionUser?.user) throw new Error("Unauthorized");

    const student = await prisma.studentProfile.findUnique({
        where: { userId: sessionUser.user.id }
    });

    if (!student) throw new Error("Only students can join as attendees for logs");

    // Double check payment/visibility logic here too for security
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const invoice = await prisma.monthlyInvoice.findUnique({
        where: {
            studentId_month_year: {
                studentId: student.id,
                month: currentMonth,
                year: currentYear
            }
        }
    });

    if (invoice?.status !== "PAID") throw new Error("Payment required for this month's live classes");

    const liveClass = await prisma.monthlyLiveClass.findUnique({
        where: { id: classId }
    });

    if (!liveClass || !liveClass.active) throw new Error("Class not found or inactive");

    // Log attendance
    await prisma.liveClassAttendance.create({
        data: {
            studentId: student.id,
            liveClassId: classId,
            session: sessionType,
            date: new Date(),
            joinTime: new Date()
        }
    });

    return liveClass.liveLink;
}

export async function getLiveClassAttendance(classId: string) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
        throw new Error("Unauthorized");
    }

    return prisma.liveClassAttendance.findMany({
        where: { liveClassId: classId },
        include: {
            student: true
        },
        orderBy: { joinTime: "desc" }
    });
}
