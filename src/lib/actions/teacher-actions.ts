"use server";

import { prisma } from "@/lib/db";
import { inviteUser, resendUserCredentials } from "@/lib/actions/auth-actions";
import { revalidatePath } from "next/cache";

export async function createTeacher(data: {
    fullName: string;
    email: string;
    designation: string;
    phone: string;
    gender: "MALE" | "FEMALE";
    joiningDate: Date;
    salary: number;
    paymentMethod: "CASH" | "BANK" | "MOBILE_BANKING";
    mobileBankingNumber?: string;
    bankAccountNumber?: string;
}) {
    // 1. Create User (Active) and send email
    const { user } = await inviteUser(data.email, "TEACHER", data.fullName);

    // 2. Update the auto-created TeacherProfile with full details
    await prisma.teacherProfile.update({
        where: { userId: user.id },
        data: {
            designation: data.designation,
            phone: data.phone,
            gender: data.gender,
            joiningDate: data.joiningDate,
            salary: data.salary,
            paymentMethod: data.paymentMethod,
            mobileBankingNumber: data.mobileBankingNumber,
            bankAccountNumber: data.bankAccountNumber,
            activeStatus: true
        }
    });

    revalidatePath("/admin/teachers");
    return { success: true };
}

export async function getTeachers() {
    return prisma.teacherProfile.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    status: true,
                },
            },
            _count: {
                select: {
                    assignedBatches: true,
                },
            },
        },
        orderBy: {
            fullName: "asc",
        },
    });
}

export async function getTeacherById(id: string) {
    return prisma.teacherProfile.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    email: true,
                    status: true,
                },
            },
            _count: {
                select: {
                    assignedBatches: true,
                },
            },
        },
    });
}

export async function deleteTeacher(id: string) {
    // In a real app, you might want to soft delete or check for dependencies
    // For now, we'll delete the TeacherProfile. 
    // Since TeacherProfile is associated with User, we might need to decide if we delete the User too.
    // Assuming we just want to remove the teacher profile wrapper or the user entirely.
    // Let's delete the user entirely for now as "Remove" usually implies that in this context.

    const teacher = await prisma.teacherProfile.findUnique({
        where: { id },
        select: { userId: true }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    // Deleting the user will cascade delete the teacher profile due to schema relations usually
    // If not, we delete profile first. Let's delete user.
    await prisma.user.delete({
        where: { id: teacher.userId }
    });

    revalidatePath("/admin/teachers");
    return { success: true };
}

export async function updateTeacher(id: string, data: {
    fullName: string;
    designation: string;
    phone: string;
    gender: "MALE" | "FEMALE";
    joiningDate: Date;
    salary: number;
    paymentMethod: "CASH" | "BANK" | "MOBILE_BANKING";
    mobileBankingNumber?: string;
    bankAccountNumber?: string;
}) {
    // 1. Get the teacher profile to find the user
    const teacher = await prisma.teacherProfile.findUnique({
        where: { id },
        select: { userId: true }
    });

    if (!teacher) throw new Error("Teacher not found");

    // 2. Update Teacher Profile
    await prisma.teacherProfile.update({
        where: { id },
        data: {
            fullName: data.fullName,
            designation: data.designation,
            phone: data.phone,
            gender: data.gender,
            joiningDate: data.joiningDate,
            salary: data.salary,
            paymentMethod: data.paymentMethod,
            mobileBankingNumber: data.mobileBankingNumber,
            bankAccountNumber: data.bankAccountNumber,
        }
    });

    // 3. Update User's full name if needed (optional, keeping consistent)
    // The inviteUser creates a user, but it doesn't store fullName in User model based on previous schema view,
    // wait, InviteUser params were (email, role, name) -> let's check inviteUser if needed.
    // Actually typically User model might not have fullName if it's in profile.
    // The previous schema view showed TeacherProfile has fullName. User has email.
    // Let's stick to updating TeacherProfile.

    revalidatePath(`/admin/teachers/${id}`);
    revalidatePath("/admin/teachers");
    return { success: true };
}

export async function resendInvitation(teacherId: string) {
    const teacher = await prisma.teacherProfile.findUnique({
        where: { id: teacherId },
        include: { user: true }
    });

    if (!teacher || !teacher.user) throw new Error("Teacher or associated user not found");

    // Always resend credentials for teachers, even if active,
    // as "Resend Invitation" in this context (auto-active users) means "Give me access again".

    await resendUserCredentials(teacher.user.email, teacher.fullName, "TEACHER");
    return { success: true };
}
