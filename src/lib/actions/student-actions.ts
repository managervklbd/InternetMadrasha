"use server";

import { prisma } from "@/lib/db";
import { inviteUser } from "./auth-actions";
import { syncStudentMonthlyInvoice } from "./billing-actions";
import { StudentMode, Residency, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendCredentialEmail } from "@/lib/mail";

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
    feeTierId?: string;
}) {
    // Validation
    if (!data.whatsappNumber) {
        throw new Error("Whatsapp number is required");
    }

    // 1. Invite User
    const { user, inviteLink } = await inviteUser(data.email, "STUDENT", data.fullName, data.whatsappNumber);

    // Normalize feeTierId
    const feeTierId = (data.feeTierId === "GENERAL" || !data.feeTierId) ? null : data.feeTierId;

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
            feeTierId: feeTierId,
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

        // 4. Automatically sync/generate the first monthly invoice
        await syncStudentMonthlyInvoice(student.id);
    }

    return { student, inviteLink };
}

export async function getStudents(filter?: { mode?: StudentMode }) {
    return prisma.studentProfile.findMany({
        where: filter?.mode ? { mode: filter.mode } : undefined,
        include: {
            user: {
                select: {
                    email: true,
                    status: true,
                },
            },
            department: {
                include: {
                    course: true
                }
            },
            enrollments: {
                include: {
                    batch: true
                },
                orderBy: {
                    joinedAt: 'desc'
                },
                take: 1
            },
            feeTier: true,
        },
        orderBy: {
            fullName: "asc",
        },
    });
}

// ... (previous code)

export async function getStudentById(id: string) {
    return prisma.studentProfile.findUnique({
        where: { id },
        include: {
            user: { select: { email: true, status: true } },
            department: {
                include: {
                    course: true // Include course for fee fallback
                }
            },
            enrollments: {
                include: { batch: true },
                orderBy: { joinedAt: 'desc' }, // Get latest
                take: 1
            },
            planHistory: { include: { plan: true }, orderBy: { startDate: 'desc' }, take: 1 },
            feeTier: true,
        },
    });
}

// ... (other functions)

export async function adminSetStudentPassword(studentId: string, newPassword: string) {
    try {
        const student = await prisma.studentProfile.findUnique({
            where: { id: studentId },
            select: { userId: true }
        });

        if (!student) throw new Error("Student not found");

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: student.userId },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error("Error setting password:", error);
        return { success: false, error: "Failed to set password" };
    }
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
    feeTierId?: string;
}) {
    // 1. Get existing student
    const existingStudent = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: { user: true, enrollments: true }
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

    // Normalize feeTierId
    const feeTierId = (data.feeTierId === "GENERAL" || !data.feeTierId) ? null : data.feeTierId;

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
            feeTierId: feeTierId,
        }
    });

    // 4. Update Enrollment (last one) or Create if changed
    let enrollmentChanged = false;
    if (data.batchId) {
        const exists = existingStudent.enrollments.some(e => e.batchId === data.batchId);
        if (!exists) {
            await prisma.enrollment.create({
                data: { studentId, batchId: data.batchId }
            });
            enrollmentChanged = true;
        }
    }

    // Sync invoice if important fields changed
    await syncStudentMonthlyInvoice(studentId);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}`);

    return updatedStudent;
}

export async function resendStudentInvitation(studentId: string) {
    try {
        const student = await prisma.studentProfile.findUnique({
            where: { id: studentId },
            include: { user: true }
        });

        if (!student || !student.user) throw new Error("Student or associated user not found");

        const { resendUserCredentials } = await import("./auth-actions");

        await resendUserCredentials(student.user.email, student.fullName, "STUDENT");

        return { success: true };
    } catch (error) {
        console.error("Error sending credential email:", error);
        return { success: false, error: "Failed to send credential email" };
    }
}

export async function toggleStudentStatus(studentId: string, currentStatus: boolean, path: string) {
    try {
        await prisma.studentProfile.update({
            where: { id: studentId },
            data: { activeStatus: !currentStatus }
        });

        const student = await prisma.studentProfile.findUnique({
            where: { id: studentId },
            select: { userId: true }
        });

        if (student) {
            await prisma.user.update({
                where: { id: student.userId },
                data: { status: !currentStatus ? "ACTIVE" : "DISABLED" }
            });
        }

        const { revalidatePath } = await import("next/cache");
        revalidatePath(path);
        return { success: true };
    } catch (error) {
        console.error("Error toggling student status:", error);
        throw error;
    }
}

export async function migrateStudentFeeTier(studentId: string, tier: string | null) {
    try {
        await prisma.studentProfile.update({
            where: { id: studentId },
            data: { feeTierId: tier }
        });

        // Sync invoice so it updates immediately
        await syncStudentMonthlyInvoice(studentId);

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/students");
        revalidatePath(`/admin/students/${studentId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update fee tier" };
    }
}

export async function bulkMigrateFeeTier(studentIds: string[], tier: string | null) {
    try {
        await prisma.studentProfile.updateMany({
            where: { id: { in: studentIds } },
            data: { feeTierId: tier }
        });

        for (const id of studentIds) {
            await syncStudentMonthlyInvoice(id);
        }

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/students");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update bulk fee tier" };
    }
}
