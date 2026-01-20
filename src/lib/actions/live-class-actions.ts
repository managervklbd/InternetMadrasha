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
    sessionKeys: string[];
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

export async function joinLiveClass(classId: string, sessionKey: string) {
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
    // Fetch session config to get the label name if needed, or just store the key
    // Ideally we should also store the session label for historical accuracy if config changes
    const sessionConfig = await prisma.liveClassSessionConfig.findUnique({
        where: { key: sessionKey }
    });

    await prisma.liveClassAttendance.create({
        data: {
            studentId: student.id,
            liveClassId: classId,
            sessionKey: sessionKey,
            sessionName: sessionConfig?.label || sessionKey,
            date: new Date(),
            joinTime: new Date()
        }
    });

    // AUTO-ATTENDANCE: Integrate with daily attendance system
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Find or Create a ClassSession for this day
        // We look for a session for this batch today that overlaps with current time or matching the sessionKey label
        let classSession = await prisma.classSession.findFirst({
            where: {
                batchId: liveClass.batchId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        if (!classSession) {
            // Create a default session for the day if none exists
            const startTime = new Date();
            const endTime = new Date();
            endTime.setHours(endTime.getHours() + 1);

            classSession = await prisma.classSession.create({
                data: {
                    batchId: liveClass.batchId,
                    date: today,
                    startTime,
                    endTime
                }
            });
        }

        // 2. Mark Attendance
        await prisma.attendance.upsert({
            where: {
                studentId_classSessionId: {
                    studentId: student.id,
                    classSessionId: classSession.id
                }
            },
            update: {
                status: "PRESENT",
                mode: "ONLINE",
                joinTime: new Date()
            },
            create: {
                studentId: student.id,
                classSessionId: classSession.id,
                status: "PRESENT",
                mode: "ONLINE",
                joinTime: new Date()
            }
        });
    } catch (error) {
        console.error("Auto-attendance failed:", error);
        // We don't throw here to avoid blocking the student from joining the link
    }

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
