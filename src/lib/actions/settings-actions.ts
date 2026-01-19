"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
    return prisma.siteSettings.findFirst({
        where: { id: 1 },
    });
}

export async function updateSiteSettings(data: {
    madrasaName: string;
    madrasaAddress?: string;
    madrasaLogo?: string;
    contactEmail?: string;
    contactPhone?: string;
    siteActive: boolean;
    // New fields
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpSecure?: boolean;
    sslStoreId?: string;
    sslStorePass?: string;
    sslIsSandbox?: boolean;
}) {
    const result = await prisma.siteSettings.upsert({
        where: { id: 1 },
        update: data,
        create: {
            ...data,
            id: 1,
        },
    });

    revalidatePath("/");
    return result;
}

