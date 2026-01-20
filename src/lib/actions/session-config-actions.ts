"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type SessionConfigData = {
    key: string;
    label: string;
    startTime: string;
    endTime: string;
    isActive?: boolean;
};

export async function createSessionConfig(data: SessionConfigData) {
    try {
        const existing = await prisma.liveClassSessionConfig.findUnique({
            where: { key: data.key }
        });

        if (existing) {
            throw new Error(`Session with key ${data.key} already exists.`);
        }

        const session = await prisma.liveClassSessionConfig.create({
            data: {
                key: data.key,
                label: data.label,
                startTime: data.startTime,
                endTime: data.endTime,
                isActive: data.isActive ?? true
            }
        });

        revalidatePath("/admin/live-classes");
        return session;
    } catch (error) {
        console.error("Error creating session config:", error);
        throw error;
    }
}

export async function getSessionConfigs() {
    try {
        const sessions = await prisma.liveClassSessionConfig.findMany({
            orderBy: { createdAt: "asc" }
        });
        return sessions;
    } catch (error) {
        console.error("Error fetching session configs:", error);
        return [];
    }
}

export async function updateSessionConfig(id: string, data: Partial<SessionConfigData>) {
    try {
        const session = await prisma.liveClassSessionConfig.update({
            where: { id },
            data
        });
        revalidatePath("/admin/live-classes");
        return session;
    } catch (error) {
        console.error("Error updating session config:", error);
        throw error;
    }
}

export async function deleteSessionConfig(id: string) {
    try {
        await prisma.liveClassSessionConfig.delete({
            where: { id }
        });
        revalidatePath("/admin/live-classes");
        return true;
    } catch (error) {
        console.error("Error deleting session config:", error);
        throw error;
    }
}
