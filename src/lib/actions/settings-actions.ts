"use server";

import { prisma } from "@/lib/db";

export async function getSiteSettings() {
    return prisma.siteSettings.findFirst({
        where: { id: 1 },
    });
}

export async function updateSiteSettings(data: {
    madrasaName: string;
    madrasaAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
    siteActive: boolean;
}) {
    return prisma.siteSettings.upsert({
        where: { id: 1 },
        update: data,
        create: {
            ...data,
            id: 1,
        },
    });
}
