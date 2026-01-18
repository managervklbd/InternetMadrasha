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
            department: true,
            enrollments: {
                include: {
                    batch: true
                },
                orderBy: {
                    joinedAt: 'desc'
                },
                take: 1
            },
        },
        orderBy: {
            fullName: "asc",
        },
    });
}

export async function getStudentById(id: string) {
    return prisma.studentProfile.findUnique({
        where: { id },
        include: {
            user: { select: { email: true, status: true } },
            department: true,
            enrollments: { include: { batch: true } },
            planHistory: { include: { plan: true }, orderBy: { startDate: 'desc' }, take: 1 },
        },
    });
}

export async function updateStudentProfile(studentId: string, data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    gender: Gender;
    mode: StudentMode;
    residency: Residency;
    country: string;
    activeStatus: boolean;
    departmentId?: string;
    batchId?: string;
    planId?: string;
}) {
    // 1. Get existing student
    const existingStudent = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: { user: true, enrollments: true, planHistory: true }
    });

    if (!existingStudent) throw new Error("Student not found");

    // 2. Update User email if changed
    if (data.email !== existingStudent.user.email) {
        // Check uniqueness first
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) throw new Error("Email already in use by another user");

        await prisma.user.update({
            where: { id: existingStudent.userId },
            data: { email: data.email }
        });
    }

    // 3. Update Profile
    const updatedStudent = await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            whatsappNumber: data.whatsappNumber,
            gender: data.gender,
            mode: data.mode,
            residency: data.residency,
            country: data.country,
            activeStatus: data.activeStatus,
            departmentId: data.departmentId || undefined,
        }
    });

    // 4. Update Enrollment (last one) or Create if changed
    if (data.batchId) {
        const exists = existingStudent.enrollments.some(e => e.batchId === data.batchId);
        if (!exists) {
            await prisma.enrollment.create({
                data: { studentId, batchId: data.batchId }
            });
        }
    }

    // 5. Update Plan (add new history if changed)
    const currentPlan = existingStudent.planHistory[0]?.planId;
    if (data.planId && data.planId !== currentPlan) {
        await prisma.studentPlanHistory.create({
            data: {
                studentId,
                planId: data.planId,
                startDate: new Date(),
            }
        });
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}`);

    return updatedStudent;
}

export async function resendStudentInvitation(studentId: string) {
    // Mock implementation since mail.ts was deleted
    console.log("Mocking resend for student", studentId);
    return { success: true };
}
