"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getFeeTiers() {
    return await prisma.feeTier.findMany({
        orderBy: { name: "asc" }
    });
}

export async function createFeeTier(data: { name: string; description?: string }) {
    if (!data.name) throw new Error("Name is required");

    const existing = await prisma.feeTier.findUnique({
        where: { name: data.name }
    });

    if (existing) throw new Error("Fee Tier with this name already exists");

    await prisma.feeTier.create({
        data: {
            name: data.name,
            description: data.description
        }
    });

    revalidatePath("/admin/billing");
    return { success: true };
}

export async function deleteFeeTier(id: string) {
    // Prevent deletion if students are assigned (optional check)
    const usageCount = await prisma.studentProfile.count({
        where: { feeTierId: id }
    });

    if (usageCount > 0) {
        throw new Error(`Cannot delete tier. ${usageCount} students are assigned to it.`);
    }

    await prisma.feeTier.delete({
        where: { id }
    });

    revalidatePath("/admin/billing");
    return { success: true };
}

export async function getTierById(id: string) {
    return await prisma.feeTier.findUnique({
        where: { id },
        include: {
            academicFees: true
        }
    });
}

export async function updateAcademicTierFee(data: {
    tierId: string;
    courseId?: string;
    departmentId?: string;
    batchId?: string;
    admissionFee: number;
    monthlyFee: number;
    examFee: number;
    admissionFeeOffline: number;
    monthlyFeeOffline: number;
    examFeeOffline: number;
}) {
    // Check if override exists
    const existing = await prisma.academicTierFee.findFirst({
        where: {
            tierId: data.tierId,
            courseId: data.courseId || null,
            departmentId: data.departmentId || null,
            batchId: data.batchId || null
        }
    });

    if (existing) {
        await prisma.academicTierFee.update({
            where: { id: existing.id },
            data: {
                admissionFee: data.admissionFee,
                monthlyFee: data.monthlyFee,
                examFee: data.examFee,
                admissionFeeOffline: data.admissionFeeOffline,
                monthlyFeeOffline: data.monthlyFeeOffline,
                examFeeOffline: data.examFeeOffline
            }
        });
    } else {
        await prisma.academicTierFee.create({
            data: {
                tierId: data.tierId,
                courseId: data.courseId || null,
                departmentId: data.departmentId || null,
                batchId: data.batchId || null,
                admissionFee: data.admissionFee,
                monthlyFee: data.monthlyFee,
                examFee: data.examFee,
                admissionFeeOffline: data.admissionFeeOffline,
                monthlyFeeOffline: data.monthlyFeeOffline,
                examFeeOffline: data.examFeeOffline
            }
        });
    }

    revalidatePath("/admin/billing");
    return { success: true };
}

export async function getAcademicTierFees(tierId: string) {
    return await prisma.academicTierFee.findMany({
        where: { tierId }
    });
}
