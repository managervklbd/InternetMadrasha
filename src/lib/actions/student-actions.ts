"use server";

import { prisma } from "@/lib/db";
import { inviteUser } from "./auth-actions";
import { StudentMode, Residency, Gender } from "@prisma/client";

export async function provisionStudent(data: {
    email: string;
    fullName: string;
    studentID: string;
    gender: Gender;
    mode: StudentMode;
    residency: Residency;
    country?: string;
    whatsappNumber?: string;
}) {
    // 1. Invite User (creates User + Auth entry)
    const { user, inviteLink } = await inviteUser(data.email, "STUDENT", data.fullName);

    // 2. Create Student Profile
    const student = await prisma.studentProfile.create({
        data: {
            userId: user.id,
            studentID: data.studentID,
            fullName: data.fullName,
            gender: data.gender,
            mode: data.mode,
            residency: data.residency,
            country: data.country,
            whatsappNumber: data.whatsappNumber,
            activeStatus: true,
        },
    });

    return { student, inviteLink };
}

export async function getStudents() {
    return prisma.studentProfile.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    status: true,
                },
            },
        },
        orderBy: {
            fullName: "asc",
        },
    });
}
