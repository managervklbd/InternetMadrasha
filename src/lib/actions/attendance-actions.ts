"use server";

import { prisma } from "@/lib/db";
import { AttendanceStatus, StudentMode } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAdminAttendanceBatches(mode?: StudentMode) {
    try {
        return await prisma.batch.findMany({
            where: {
                active: true,
                allowedMode: mode ? mode : undefined
            },
            include: {
                department: {
                    include: { course: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching batches for attendance:", error);
        return [];
    }
}

export async function getBatchAttendanceData(batchId: string, date: Date) {
    try {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // 1. Get all students enrolled in this batch
        const students = await prisma.studentProfile.findMany({
            where: {
                enrollments: {
                    some: { batchId }
                },
                activeStatus: true
            },
            select: {
                id: true,
                fullName: true,
                studentID: true,
                mode: true,
            },
            orderBy: { fullName: 'asc' }
        });

        // 2. Get sessions for this batch on this date
        const studentIds = students.map(s => s.id);
        const sessions = await prisma.classSession.findMany({
            where: {
                batchId,
                date: {
                    gte: dayStart,
                    lte: dayEnd
                }
            },
            include: {
                attendance: {
                    where: {
                        studentId: { in: studentIds }
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        });

        return { students, sessions };
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        return { students: [], sessions: [] };
    }
}

export async function createAdminClassSession(data: {
    batchId: string;
    date: Date;
    name: string; // e.g., "Morning Session"
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
}) {
    try {
        const [startHours, startMins] = data.startTime.split(':').map(Number);
        const [endHours, endMins] = data.endTime.split(':').map(Number);

        const startTime = new Date(data.date);
        startTime.setHours(startHours, startMins, 0, 0);

        const endTime = new Date(data.date);
        endTime.setHours(endHours, endMins, 0, 0);

        const session = await prisma.classSession.create({
            data: {
                batchId: data.batchId,
                date: data.date,
                startTime,
                endTime
            }
        });

        return { success: true, session };
    } catch (error) {
        console.error("Error creating class session:", error);
        return { success: false, error: "সেশন তৈরি করতে ব্যর্থ হয়েছে।" };
    }
}

export async function adminMarkAttendance(data: {
    studentId: string;
    sessionId: string;
    status: AttendanceStatus;
    mode: StudentMode;
}) {
    try {
        const joinTime = (data.status === "PRESENT" || data.status === "LATE") ? new Date() : null;
        const attendance = await prisma.attendance.upsert({
            where: {
                studentId_classSessionId: {
                    studentId: data.studentId,
                    classSessionId: data.sessionId
                }
            },
            update: {
                status: data.status,
                mode: data.mode,
                joinTime: joinTime
            },
            create: {
                studentId: data.studentId,
                classSessionId: data.sessionId,
                status: data.status,
                mode: data.mode,
                joinTime: joinTime
            }
        });

        return { success: true, attendance };
    } catch (error) {
        console.error("Error marking attendance:", error);
        return { success: false, error: "হাজিরা আপডেট করতে ব্যর্থ হয়েছে।" };
    }
}

export async function adminBulkMarkAttendance(data: {
    sessionId: string;
    updates: { studentId: string; status: AttendanceStatus; mode: StudentMode }[];
}) {
    try {
        // Use a transaction for safety
        const now = new Date();
        await prisma.$transaction(
            data.updates.map(update => {
                const joinTime = (update.status === "PRESENT" || update.status === "LATE") ? now : null;
                return prisma.attendance.upsert({
                    where: {
                        studentId_classSessionId: {
                            studentId: update.studentId,
                            classSessionId: data.sessionId
                        }
                    },
                    update: {
                        status: update.status,
                        mode: update.mode,
                        joinTime: joinTime
                    },
                    create: {
                        studentId: update.studentId,
                        classSessionId: data.sessionId,
                        status: update.status,
                        mode: update.mode,
                        joinTime: joinTime
                    }
                });
            })
        );

        return { success: true };
    } catch (error) {
        console.error("Error bulk marking attendance:", error);
        return { success: false, error: "বাল্ক হাজিরা আপডেট করতে ব্যর্থ হয়েছে।" };
    }
}
