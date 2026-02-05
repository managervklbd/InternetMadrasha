"use server";

import { prisma } from "@/lib/db";
import { inviteUser, resendUserCredentials } from "@/lib/actions/auth-actions";
import { revalidatePath } from "next/cache";

export async function createTeacher(data: {
    fullName: string;
    email: string;
    designation: string;
    phone: string;
    whatsappNumber?: string;
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
            whatsappNumber: data.whatsappNumber,
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
    const teacher = await prisma.teacherProfile.findUnique({
        where: { id },
        select: { id: true, userId: true }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    // Use a transaction to ensure all or nothing
    await prisma.$transaction(async (tx) => {
        // 1. Handle MonthlyLiveClass dependencies (Cascade manually)
        // Find all live classes by this teacher
        const liveClasses = await tx.monthlyLiveClass.findMany({
            where: { teacherId: id },
            select: { id: true }
        });

        const liveClassIds = liveClasses.map(lc => lc.id);

        if (liveClassIds.length > 0) {
            // Delete attendances for these classes first
            await tx.liveClassAttendance.deleteMany({
                where: { liveClassId: { in: liveClassIds } }
            });

            // Delete the live classes
            await tx.monthlyLiveClass.deleteMany({
                where: { id: { in: liveClassIds } }
            });
        }

        // 2. Handle Homework (Set teacher to null to preserve student submissions)
        await tx.homework.updateMany({
            where: { teacherId: id },
            data: { teacherId: null }
        });

        // 3. Handle Lessons (Set teacher to null)
        await tx.lesson.updateMany({
            where: { teacherId: id },
            data: { teacherId: null }
        });

        // 4. Handle User dependencies (Logs which don't have cascade delete)
        await tx.aiLog.deleteMany({
            where: { userId: teacher.userId }
        });

        await tx.adminActionLog.deleteMany({
            where: { adminId: teacher.userId }
        });

        // 5. Delete the user (This cascades to TeacherProfile, Payments, Attendance)
        await tx.user.delete({
            where: { id: teacher.userId }
        });
    });

    revalidatePath("/admin/teachers");
    return { success: true };
}

export async function updateTeacher(id: string, data: {
    fullName: string;
    designation: string;
    phone: string;
    whatsappNumber?: string;
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
            whatsappNumber: data.whatsappNumber,
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

export async function getTeacherDependencies(id: string) {
    const [batches, liveClasses, homeworks, lessons] = await Promise.all([
        prisma.batch.count({
            where: { teachers: { some: { id } } }
        }),
        prisma.monthlyLiveClass.count({
            where: { teacherId: id }
        }),
        prisma.homework.count({
            where: { teacherId: id }
        }),
        prisma.lesson.count({
            where: { teacherId: id }
        })
    ]);

    return {
        batches,
        liveClasses,
        homeworks,
        lessons
    };
}
