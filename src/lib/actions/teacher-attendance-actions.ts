"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { TeacherAttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Teacher checks in for the day
 */
export async function checkInTeacher() {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!teacher) throw new Error("Teacher profile not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInTime = new Date();

    // Determine status based on check-in time
    const hour = checkInTime.getHours();
    const minute = checkInTime.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 30); // Late if after 9:30 AM

    const attendance = await prisma.teacherAttendance.upsert({
        where: {
            teacherId_date: {
                teacherId: teacher.id,
                date: today,
            },
        },
        update: {
            checkIn: checkInTime,
            status: isLate ? "LATE" : "PRESENT",
        },
        create: {
            teacherId: teacher.id,
            date: today,
            checkIn: checkInTime,
            status: isLate ? "LATE" : "PRESENT",
        },
    });

    revalidatePath("/teacher/attendance");
    return { success: true, attendance };
}

/**
 * Teacher checks out for the day
 */
export async function checkOutTeacher() {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!teacher) throw new Error("Teacher profile not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.teacherAttendance.findUnique({
        where: {
            teacherId_date: {
                teacherId: teacher.id,
                date: today,
            },
        },
    });

    if (!attendance) {
        throw new Error("No check-in record found for today");
    }

    const checkOutTime = new Date();
    const workingHours = (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    // Determine if half-day based on working hours
    const isHalfDay = workingHours < 4;

    const updated = await prisma.teacherAttendance.update({
        where: { id: attendance.id },
        data: {
            checkOut: checkOutTime,
            workingHours: parseFloat(workingHours.toFixed(2)),
            status: isHalfDay ? "HALF_DAY" : attendance.status,
        },
    });

    revalidatePath("/teacher/attendance");
    return { success: true, attendance: updated };
}

/**
 * Get today's attendance for logged-in teacher
 */
export async function getTeacherTodayAttendance() {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!teacher) throw new Error("Teacher profile not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.teacherAttendance.findUnique({
        where: {
            teacherId_date: {
                teacherId: teacher.id,
                date: today,
            },
        },
    });

    return attendance;
}

/**
 * Get attendance history for logged-in teacher
 */
export async function getTeacherAttendanceHistory(params?: {
    month?: number;
    year?: number;
    limit?: number;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!teacher) throw new Error("Teacher profile not found");

    const where: any = { teacherId: teacher.id };

    if (params?.month && params?.year) {
        const startDate = new Date(params.year, params.month - 1, 1);
        const endDate = new Date(params.year, params.month, 0);
        where.date = {
            gte: startDate,
            lte: endDate,
        };
    }

    const attendance = await prisma.teacherAttendance.findMany({
        where,
        orderBy: { date: "desc" },
        take: params?.limit || 100,
    });

    return attendance;
}

/**
 * Get attendance statistics for logged-in teacher
 */
export async function getTeacherAttendanceStats(month?: number, year?: number) {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!teacher) throw new Error("Teacher profile not found");

    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const attendance = await prisma.teacherAttendance.findMany({
        where: {
            teacherId: teacher.id,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    const stats = {
        totalDays: attendance.length,
        present: attendance.filter(a => a.status === "PRESENT").length,
        absent: attendance.filter(a => a.status === "ABSENT").length,
        late: attendance.filter(a => a.status === "LATE").length,
        halfDay: attendance.filter(a => a.status === "HALF_DAY").length,
        leave: attendance.filter(a => a.status === "LEAVE" || a.status === "SICK_LEAVE").length,
        totalWorkingHours: attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0),
    };

    return { stats, attendance };
}

/**
 * Admin: Get all teachers' attendance for a specific date
 */
export async function getAllTeachersAttendance(date: Date) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const teachers = await prisma.teacherProfile.findMany({
        where: { activeStatus: true },
        include: {
            user: {
                select: { email: true },
            },
            attendance: {
                where: { date: targetDate },
            },
        },
        orderBy: { fullName: "asc" },
    });

    return teachers.map(teacher => ({
        id: teacher.id,
        fullName: teacher.fullName,
        designation: teacher.designation,
        email: teacher.user.email,
        attendance: teacher.attendance[0] || null,
    }));
}

/**
 * Admin: Manually mark teacher attendance
 */
export async function adminMarkTeacherAttendance(data: {
    teacherId: string;
    date: Date;
    status: TeacherAttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const targetDate = new Date(data.date);
    targetDate.setHours(0, 0, 0, 0);

    let workingHours: number | undefined;
    if (data.checkIn && data.checkOut) {
        workingHours = (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60);
        workingHours = parseFloat(workingHours.toFixed(2));
    }

    const attendance = await prisma.teacherAttendance.upsert({
        where: {
            teacherId_date: {
                teacherId: data.teacherId,
                date: targetDate,
            },
        },
        update: {
            status: data.status,
            checkIn: data.checkIn || new Date(),
            checkOut: data.checkOut,
            workingHours,
            notes: data.notes,
            markedBy: session.user.id,
        },
        create: {
            teacherId: data.teacherId,
            date: targetDate,
            status: data.status,
            checkIn: data.checkIn || new Date(),
            checkOut: data.checkOut,
            workingHours,
            notes: data.notes,
            markedBy: session.user.id,
        },
    });

    revalidatePath("/admin/teacher-attendance");
    return { success: true, attendance };
}

/**
 * Admin: Get monthly attendance report for a teacher
 */
export async function getTeacherAttendanceReport(teacherId: string, month: number, year: number) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [teacher, attendance] = await Promise.all([
        prisma.teacherProfile.findUnique({
            where: { id: teacherId },
            include: {
                user: { select: { email: true } },
            },
        }),
        prisma.teacherAttendance.findMany({
            where: {
                teacherId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: "asc" },
        }),
    ]);

    if (!teacher) throw new Error("Teacher not found");

    const stats = {
        totalDays: attendance.length,
        present: attendance.filter(a => a.status === "PRESENT").length,
        absent: attendance.filter(a => a.status === "ABSENT").length,
        late: attendance.filter(a => a.status === "LATE").length,
        halfDay: attendance.filter(a => a.status === "HALF_DAY").length,
        leave: attendance.filter(a => a.status === "LEAVE" || a.status === "SICK_LEAVE").length,
        totalWorkingHours: attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0),
    };

    return {
        teacher: {
            id: teacher.id,
            fullName: teacher.fullName,
            designation: teacher.designation,
            email: teacher.user.email,
            salary: teacher.salary,
        },
        attendance,
        stats,
        month,
        year,
    };
}

/**
 * Admin: Delete attendance record
 */
export async function deleteTeacherAttendance(id: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.teacherAttendance.delete({
        where: { id },
    });

    revalidatePath("/admin/teacher-attendance");
    return { success: true };
}
