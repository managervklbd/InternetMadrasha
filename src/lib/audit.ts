import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function logAdminAction(
    action: string,
    targetModel: string,
    targetId: string,
    details?: any
) {
    try {
        const session = await auth();
        const adminId = session?.user?.id;

        if (!adminId) {
            console.warn("Audit log attempted without authenticated admin");
            return;
        }

        // Verify admin exists to prevent FK violation (e.g. stale session)
        const adminExists = await prisma.user.findUnique({
            where: { id: adminId },
            select: { id: true }
        });

        if (!adminExists) {
            console.warn(`Audit log skipped: Admin ID ${adminId} not found in database.`);
            return;
        }

        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";

        await prisma.adminActionLog.create({
            data: {
                adminId,
                action,
                targetModel,
                targetId,
                details: details || {},
                ipAddress: ip,
            },
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // We do not throw here to prevent breaking the main transaction
        // But in a high-security context, we might want to ensure auditing succeeds
    }
}
