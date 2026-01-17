import { prisma } from "@/lib/db";
import { StudentMode } from "@prisma/client";

export const attendanceService = {
    async recordAttendance(data: {
        studentId: string;
        sessionId: string;
        batchId: string;
        mode: StudentMode;
        date: Date;
    }) {
        return prisma.attendanceRecord.upsert({
            where: {
                date_sessionId_studentId: {
                    date: data.date,
                    sessionId: data.sessionId,
                    studentId: data.studentId,
                },
            },
            update: {
                mode: data.mode,
            },
            create: {
                date: data.date,
                sessionId: data.sessionId,
                studentId: data.studentId,
                batchId: data.batchId,
                mode: data.mode,
            },
        });
    },

    async getDailyAttendance(date: Date, batchId: string) {
        return prisma.attendanceRecord.findMany({
            where: {
                date,
                batchId,
            },
            include: {
                student: true,
                session: true,
            },
        });
    },
};
