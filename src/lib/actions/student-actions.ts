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
    phoneNumber?: string;
    whatsappNumber?: string;
    departmentId?: string;
    batchId?: string; // Semester ID
    planId: string;
}) {
    // 1. Invite User
    const { user, inviteLink } = await inviteUser(data.email, "STUDENT", data.fullName);

    // 2. Create Student Profile with Department
    const student = await prisma.studentProfile.create({
        data: {
            userId: user.id,
            studentID: data.studentID,
            fullName: data.fullName,
            gender: data.gender,
            mode: data.mode,
            residency: data.residency,
            country: data.country,
            phoneNumber: data.phoneNumber,
            whatsappNumber: data.whatsappNumber,
            activeStatus: true,
            departmentId: data.departmentId,
        },
    });

    // 3. Create Enrollment (if batch selected)
    if (data.batchId) {
        await prisma.enrollment.create({
            data: {
                studentId: student.id,
                batchId: data.batchId,
            }
        });
    }

    // 4. Create Initial Plan History
    if (data.planId) {
        await prisma.studentPlanHistory.create({
            data: {
                studentId: student.id,
                planId: data.planId,
                startDate: new Date(),
            }
        });
    }

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
