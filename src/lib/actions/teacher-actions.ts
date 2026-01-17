"use server";

import { prisma } from "@/lib/db";

export async function getTeachers() {
    return prisma.teacherProfile.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    status: true,
                },
            },
            _count: {
                select: {
                    assignedBatches: true,
                },
            },
        },
        orderBy: {
            fullName: "asc",
        },
    });
}
