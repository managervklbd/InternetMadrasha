"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { InvoiceStatus } from "@prisma/client";

async function getStudentProfile() {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
        throw new Error("Unauthorized");
    }

    const profile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            planHistory: {
                where: { endDate: null },
                include: { plan: true }
            }
        }
    });

    if (!profile) throw new Error("Student profile not found");
    return profile;
}

export async function getStudentDashboardData() {
    const profile = await getStudentProfile();

    // 1. Get Latest Invoice
    const latestInvoice = await prisma.monthlyInvoice.findFirst({
        where: { studentId: profile.id },
        orderBy: { issuedAt: "desc" },
        include: { plan: true }
    });

    // 2. Get Today's Sessions for Enrolled Batches
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const sessions = await prisma.classSession.findMany({
        where: {
            batch: {
                enrollments: {
                    some: { studentId: profile.id }
                }
            },
            date: {
                gte: todayStart,
                lte: todayEnd
            }
        },
        include: {
            batch: true
        }
    });

    // 3. Get Homework Count
    const homeworkCount = await prisma.homework.count({
        where: {
            batch: {
                enrollments: {
                    some: { studentId: profile.id }
                }
            },
            deadline: { gte: new Date() }
        }
    });

    // 4. Check Attendance for Today
    const attendanceToday = await prisma.attendance.findMany({
        where: {
            studentId: profile.id,
            classSession: {
                date: { gte: todayStart, lte: todayEnd }
            }
        }
    });

    return {
        profile,
        latestInvoice,
        sessions,
        homeworkCount,
        attendanceToday
    };
}

export async function joinClass(sessionId: string) {
    const profile = await getStudentProfile();

    // Rule: Only online students can join via portal
    if (profile.mode !== "ONLINE") {
        throw new Error("Only online students can join classes via the portal.");
    }

    // Rule: Must be paid to join
    const unpaidInvoices = await prisma.monthlyInvoice.count({
        where: {
            studentId: profile.id,
            status: InvoiceStatus.UNPAID
        }
    });

    if (unpaidInvoices > 0) {
        throw new Error("Please clear your outstanding dues to join the class.");
    }

    // Auto-record attendance
    return prisma.attendance.upsert({
        where: {
            studentId_classSessionId: {
                studentId: profile.id,
                classSessionId: sessionId
            }
        },
        update: {
            joinTime: new Date()
        },
        create: {
            studentId: profile.id,
            classSessionId: sessionId,
            mode: "ONLINE",
            status: "PRESENT",
            joinTime: new Date()
        }
    });
}
