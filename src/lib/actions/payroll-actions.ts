"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getMonthlyPayrollOverview(month: number, year: number) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

    // Get all active teachers
    const teachers = await prisma.teacherProfile.findMany({
        where: { activeStatus: true },
        select: {
            id: true,
            fullName: true,
            designation: true,
            salary: true,
            payments: {
                where: { month, year },
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    paymentDate: true
                }
            }
        },
        orderBy: { fullName: 'asc' }
    });

    // Calculate totals
    const totalSalaries = teachers.reduce((sum, t) => sum + (t.salary || 0), 0);
    const paidCount = teachers.filter(t => t.payments.length > 0 && t.payments[0].status === 'PAID').length;
    const totalPaid = teachers.reduce((sum, t) => {
        const payment = t.payments[0]; // Assuming one payment per month
        return sum + (payment?.status === 'PAID' ? payment.amount : 0);
    }, 0);

    return {
        teachers: teachers.map(t => ({
            ...t,
            paymentStatus: t.payments.length > 0 ? t.payments[0].status : 'UNPAID',
            paidAmount: t.payments.length > 0 ? t.payments[0].amount : 0,
            paymentId: t.payments.length > 0 ? t.payments[0].id : null
        })),
        summary: {
            totalTeachers: teachers.length,
            totalBaseSalary: totalSalaries,
            totalPaid: totalPaid,
            pendingCount: teachers.length - paidCount
        }
    };
}

export async function processTeacherPayment(data: {
    teacherId: string;
    month: number;
    year: number;
    basicSalary: number;
    bonus: number; // Defaults to 0 if not passed
    deduction: number; // Defaults to 0 if not passed
    paymentMethod: PaymentMethod;
    note?: string;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    const totalAmount = data.basicSalary + (data.bonus || 0) - (data.deduction || 0);

    // Check if already paid
    const existing = await prisma.teacherPayment.findFirst({
        where: {
            teacherId: data.teacherId,
            month: data.month,
            year: data.year
        }
    });

    if (existing) {
        throw new Error("Payment already recorded for this month. Delete existing record to re-process.");
    }

    await prisma.teacherPayment.create({
        data: {
            teacherId: data.teacherId,
            month: data.month,
            year: data.year,
            basicSalary: data.basicSalary,
            bonus: data.bonus || 0,
            deduction: data.deduction || 0,
            amount: totalAmount,
            method: data.paymentMethod,
            status: "PAID",
            note: data.note,
            paymentDate: new Date()
        }
    });

    revalidatePath("/admin/payroll");
    revalidatePath(`/admin/payroll/pay/${data.teacherId}`);
    return { success: true };
}

export async function getTeacherPaymentHistory(teacherId: string) {
    // Auth check: Admin or the teacher themselves
    const session = await auth();
    if (!session?.user) return [];

    let isAuthorized = false;
    if (session.user.role === "ADMIN") isAuthorized = true;
    else if (session.user.role === "TEACHER") {
        const teacher = await prisma.teacherProfile.findUnique({ where: { userId: session.user.id } });
        if (teacher && teacher.id === teacherId) isAuthorized = true;
    }

    if (!isAuthorized) return [];

    return await prisma.teacherPayment.findMany({
        where: { teacherId },
        orderBy: { paymentDate: 'desc' }
    });
}
