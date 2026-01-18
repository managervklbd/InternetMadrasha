"use server";

import { prisma } from "@/lib/db";

export async function getPlans() {
    return prisma.plan.findMany({
        orderBy: {
            monthlyFee: 'asc'
        }
    });
}

export async function createPlan(data: {
    name: string;
    monthlyFee: number;
    description?: string;
}) {
    if (!data.name || data.monthlyFee < 0) {
        return { success: false, error: "Invalid data" };
    }

    try {
        const plan = await prisma.plan.create({
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                description: data.description
            }
        });
        return { success: true, data: plan };
    } catch (error) {
        console.error("Error creating plan:", error);
        return { success: false, error: "Failed to create plan" };
    }
}

export async function deletePlan(id: string) {
    if (!id) return { success: false, error: "ID required" };

    try {
        await prisma.plan.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Error deleting plan:", error);
        return { success: false, error: "Failed to delete plan" };
    }
}
