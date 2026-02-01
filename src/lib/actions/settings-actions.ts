"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

import { cache } from "react";

export const getSiteSettings = cache(async function () {
    return prisma.siteSettings.findFirst({
        where: { id: 1 },
    });
});

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


import { cookies } from "next/headers";

export async function setAdminViewMode(mode: "ONLINE" | "OFFLINE") {
    const cookieStore = await cookies();
    cookieStore.set("adminViewMode", mode, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "strict"
    });
    revalidatePath("/");
}

export async function getAdminViewMode() {
    const cookieStore = await cookies();
    const mode = cookieStore.get("adminViewMode")?.value;
    return (mode === "OFFLINE" ? "OFFLINE" : "ONLINE") as "ONLINE" | "OFFLINE";
}


