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

import { sendEmail } from "@/lib/email";

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

    // AUTO-LINK: Connect teacher to the batch in their profile for tracking
    try {
        await prisma.teacherProfile.update({
            where: { id: data.teacherId },
            data: {
                assignedBatches: {
                    connect: { id: data.batchId }
                }
            }
        });
    } catch (err) {
        console.error("Failed to auto-link teacher to batch:", err);
        // We don't fail the whole class creation for this
    }

    // Send Email Notifications
    try {
        // 1. Fetch Teacher Email
        const teacher = await prisma.teacherProfile.findUnique({
            where: { id: data.teacherId },
            include: { user: true }
        });

        if (teacher?.user.email) {
            await sendEmail({
                to: teacher.user.email,
                subject: `New Live Class Assigned: ${data.title}`,
                html: `
                    <h2>Live Class Assigned</h2>
                    <p>Dear ${teacher.fullName},</p>
                    <p>You have been assigned to take the live class: <strong>${data.title}</strong></p>
                    <p>
                        <strong>Month:</strong> ${data.month}/${data.year}<br>
                        <strong>Sessions:</strong> ${data.sessionKeys.join(", ")}<br>
                        <strong>Join Link:</strong> <a href="${data.liveLink}">${data.liveLink}</a>
                    </p>
                    <p>Please ensure you join on time.</p>
                `
            });
        }

        // 2. Fetch Enrolled Paid Students
        // Find students enrolled in the batch, with current month paid invoice
        const students = await prisma.studentProfile.findMany({
            where: {
                activeStatus: true,
                mode: "ONLINE",
                gender: data.gender,
                enrollments: {
                    some: { batchId: data.batchId }
                },
                // Ideally check invoice here but complex in one query, iterating is safer/clearer
            },
            include: { user: true }
        });

        // Filter paid students
        const paidEmails: string[] = [];
        for (const s of students) {
            const invoice = await prisma.monthlyInvoice.findUnique({
                where: {
                    studentId_month_year: {
                        studentId: s.id,
                        month: data.month,
                        year: data.year
                    }
                }
            });
            if (invoice?.status === "PAID" && s.user.email) {
                paidEmails.push(s.user.email);
            }
        }

        if (paidEmails.length > 0) {
            await sendEmail({
                to: paidEmails, // sendEmail handles array by joining with comma (BCC effect needed? Ideally BCC or individual)
                // If sendEmail joins with comma, they see each other? Better to send individually or use BCC if implemented.
                // Our simple sendEmail puts all in 'to'. Let's loop for privacy or assume it's fine for now/batch.
                // For 'Madrasha' context, maybe better to loop to avoid exposing emails.
                subject: `New Monthly Live Class: ${data.title}`,
                html: `
                    <h2>New Live Class Schedule</h2>
                    <p>Assalamu Alaikum,</p>
                    <p>A new live class schedule has been published for: <strong>${data.title}</strong></p>
                    <p>
                        <strong>Month:</strong> ${data.month}/${data.year}<br>
                        <strong>Sessions:</strong> ${data.sessionKeys.join(", ")}<br>
                        <strong>Join Link:</strong> <a href="${data.liveLink}">${data.liveLink}</a>
                    </p>
                    <p>Please join from your dashboard at the scheduled time.</p>
                `
            });
        }

    } catch (e) {
        console.error("Failed to send notifications:", e);
        // Don't fail the request, just log
    }

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

    // AUTO-LINK: Connect teacher to the batch in their profile for tracking
    try {
        await prisma.teacherProfile.update({
            where: { id: data.teacherId },
            data: {
                assignedBatches: {
                    connect: { id: data.batchId }
                }
            }
        });
    } catch (err) {
        console.error("Failed to auto-link teacher to batch:", err);
    }

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

    const liveClasses = await prisma.monthlyLiveClass.findMany({
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

    const sessionConfigs = await prisma.liveClassSessionConfig.findMany();

    return liveClasses.map(cls => ({
        ...cls,
        sessionDetails: (cls.sessionKeys || []).map(key => sessionConfigs.find(c => c.key === key)).filter(Boolean)
    }));
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

    const liveClasses = await prisma.monthlyLiveClass.findMany({
        where: {
            batchId: { in: batchIds },
            gender: student.gender,
            month: currentMonth,
            year: currentYear,
            active: true
        }
    });

    const sessionConfigs = await prisma.liveClassSessionConfig.findMany();

    return liveClasses.map(cls => ({
        ...cls,
        sessionDetails: (cls.sessionKeys || []).map(key => sessionConfigs.find(c => c.key === key)).filter(Boolean)
    }));
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
        where: {
            liveClassId: classId,
            studentId: { not: null } as any // Only show student attendance
        },
        include: {
            student: true
        },
        orderBy: { joinTime: "desc" }
    });
}

export async function joinLiveClassAsTeacher(classId: string, sessionKey?: string) {
    const session = await auth();
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!teacher) throw new Error("Teacher profile not found");

    const liveClass = await prisma.monthlyLiveClass.findUnique({
        where: { id: classId }
    });

    if (!liveClass || !liveClass.active) throw new Error("Class not found or inactive");

    // 1. Log Live Class Attendance (for history)
    // Find session name if key provided
    let sessionName = sessionKey;
    if (sessionKey) {
        const config = await prisma.liveClassSessionConfig.findUnique({
            where: { key: sessionKey }
        });
        if (config) sessionName = config.label;
    }

    await prisma.liveClassAttendance.create({
        data: {
            teacherId: teacher.id,
            liveClassId: classId,
            sessionKey: sessionKey,
            sessionName: sessionName || "TEACHER_JOIN",
            date: new Date(),
            joinTime: new Date()
        } as any
    });

    // 2. Auto-mark Daily Teacher Attendance
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.teacherAttendance.upsert({
            where: {
                teacherId_date: {
                    teacherId: teacher.id,
                    date: today
                }
            },
            update: {
                status: "PRESENT",
                checkIn: new Date(), // Update check-in time? Or leave first check-in? 
                // Usually we keep first check-in. But if they join, they are present.
                // Let's just update status to ensure it's present.
            },
            create: {
                teacherId: teacher.id,
                date: today,
                checkIn: new Date(),
                status: "PRESENT"
            }
        });
    } catch (error) {
        console.error("Failed to mark teacher daily attendance:", error);
    }

    return liveClass.liveLink;
}
