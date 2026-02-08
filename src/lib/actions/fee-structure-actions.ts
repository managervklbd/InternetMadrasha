"use server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getFeeHeads() {
    try {
        const heads = await prisma.feeHead.findMany({
            where: { active: true },
            orderBy: { createdAt: 'asc' }
        });
        return heads;
    } catch (error) {
        console.error("Error fetching fee heads:", error);
        return [];
    }
}

export async function createFeeHead(name: string) {
    if (!name) return { success: false, error: "Name required" };

    try {
        // Check if exists (even if inactive, maybe reactivate?)
        const existing = await prisma.feeHead.findUnique({
            where: { name }
        });

        if (existing) {
            if (!existing.active) {
                // Reactivate
                await prisma.feeHead.update({
                    where: { id: existing.id },
                    data: { active: true }
                });
                return { success: true, data: existing };
            }
            return { success: false, error: "Fee head already exists" };
        }

        const head = await prisma.feeHead.create({
            data: { name, active: true }
        });

        await logAdminAction("CREATE_FEE_HEAD", "FeeHead", head.id, { name });
        revalidatePath("/admin/billing");
        return { success: true, data: head };
    } catch (error: any) {
        console.error("Error creating fee head:", error);
        return { success: false, error: error.message || "Failed to create fee head" };
    }
}

export async function deleteFeeHead(id: string) {
    if (!id) return { success: false, error: "ID required" };

    try {
        // Hard delete for now, or soft delete?
        // Schema supports cascade delete of values.
        // Let's soft delete to be safe if that's what the UI expects (since it filters by active?)
        // The `getFeeHeads` filters by `active: true`.
        // So soft delete is safer.

        await prisma.feeHead.update({
            where: { id },
            data: { active: false }
        });

        await logAdminAction("DELETE_FEE_HEAD", "FeeHead", id, {});
        revalidatePath("/admin/billing");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting fee head:", error);
        return { success: false, error: error.message || "Failed to delete fee head" };
    }
}

export async function updateAcademicFee(
    entityId: string,
    type: 'COURSE' | 'DEPARTMENT' | 'BATCH',
    feeHeadId: string,
    amount: number
) {
    if (!entityId || !feeHeadId || amount === undefined) {
        return { success: false, error: "Invalid parameters" };
    }

    try {
        // Identify the correct field based on type
        const whereClause: any = { feeHeadId };
        if (type === 'COURSE') whereClause.courseId = entityId;
        else if (type === 'DEPARTMENT') whereClause.departmentId = entityId;
        else if (type === 'BATCH') whereClause.batchId = entityId;
        else return { success: false, error: "Invalid type" };

        // Check if exists
        const existing = await prisma.academicFee.findFirst({
            where: whereClause
        });

        if (existing) {
            // Update
            await prisma.academicFee.update({
                where: { id: existing.id },
                data: { amount }
            });
        } else {
            // Create
            const data: any = {
                feeHeadId,
                amount
            };
            if (type === 'COURSE') data.courseId = entityId;
            else if (type === 'DEPARTMENT') data.departmentId = entityId;
            else if (type === 'BATCH') data.batchId = entityId;

            await prisma.academicFee.create({
                data
            });
        }

        revalidatePath("/admin/billing");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating academic fee:", error);
        return { success: false, error: error.message || "Failed to update fee" };
    }
}
