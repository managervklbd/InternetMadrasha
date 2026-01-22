"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const GetAuditLogsSchema = z.object({
    limit: z.number().min(1).max(1000).default(50),
});

export async function getAuditLogs(limit = 50) {
    // Validate input
    const result = GetAuditLogsSchema.safeParse({ limit });
    const safeLimit = result.success ? result.data.limit : 50;

    const logs = await prisma.adminActionLog.findMany({
        take: safeLimit,
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

