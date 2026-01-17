"use server";

import { prisma } from "@/lib/db";

export async function getAuditLogs(limit = 50) {
    const logs = await prisma.adminActionLog.findMany({
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            admin: {
                select: {
                    email: true,
                    role: true,
                }
            }
        }
    });

    return logs;
}
