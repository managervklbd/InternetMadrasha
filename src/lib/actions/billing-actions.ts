"use server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export async function getPlans() {
    return prisma.plan.findMany({
        orderBy: {
            monthlyFee: 'asc'
        }
    });
}

export async function createPlan(data: {
    name: string;
    monthlyFee: number;
    description?: string;
}) {
    if (!data.name || data.monthlyFee < 0) {
        return { success: false, error: "Invalid data" };
    }

    try {
        const plan = await prisma.plan.create({
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                description: data.description
            }
        });
        await logAdminAction("CREATE_PLAN", "Plan", plan.id, { name: plan.name, fee: plan.monthlyFee });
        return { success: true, data: plan };
    } catch (error) {
        console.error("Error creating plan:", error);
        return { success: false, error: "Failed to create plan" };
    }
}

export async function deletePlan(id: string) {
    if (!id) return { success: false, error: "ID required" };

    try {
        await prisma.plan.delete({ where: { id } });
        await logAdminAction("DELETE_PLAN", "Plan", id, {});
        return { success: true };
    } catch (error) {
        console.error("Error deleting plan:", error);
        return { success: false, error: "Failed to delete plan" };
    }
}

/**
 * Logic to ensure a student has an invoice for the current month.
 * Can be called during student creation or bulk generation.
 */
/**
 * Helper to calculate applicable monthly and admission fees based on student mode and tier.
 */
function calculateApplicableFees(student: any, batch: any, department: any, course: any) {
    let monthlyAmount = 0;
    let admissionAmount = 0;

    const isOffline = student.mode === "OFFLINE";
    const isSadka = student.feeTier === "SADKA";

    // 1. Calculate Monthly Fee
    if (isOffline) {
        if (isSadka) {
            monthlyAmount = batch.sadkaFeeOffline ?? department.sadkaFeeOffline ?? course.sadkaFeeOffline ?? 0;
        } else {
            monthlyAmount = batch.monthlyFeeOffline ?? department.monthlyFeeOffline ?? course.monthlyFeeOffline ?? 0;
        }
    } else {
        // Online
        if (isSadka) {
            monthlyAmount = batch.sadkaFee ?? department.sadkaFee ?? course.sadkaFee ?? 0;
        } else {
            monthlyAmount = batch.monthlyFee ?? department.monthlyFee ?? course.monthlyFee ?? 0;
        }
    }

    // 2. Calculate Admission Fee
    if (isOffline) {
        admissionAmount = batch.admissionFeeOffline ?? department.admissionFeeOffline ?? course.admissionFeeOffline ?? 0;
    } else {
        admissionAmount = batch.admissionFee ?? department.admissionFee ?? course.admissionFee ?? 0;
    }

    return { monthlyAmount, admissionAmount };
}

/**
 * Get the calculated monthly fee for a student.
 * Useful for client-side fee display.
 */
export async function getStudentMonthlyFee(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
            enrollments: {
                include: {
                    batch: {
                        include: {
                            department: {
                                include: { course: true }
                            }
                        }
                    }
                },
                orderBy: { joinedAt: 'desc' },
                take: 1
            },
            planHistory: {
                include: { plan: true },
                orderBy: { startDate: 'desc' },
                take: 1
            }
        }
    });

    if (!student || !student.activeStatus) return { success: false, error: "Student not found or inactive" };

    // Get Paid Months
    const paidInvoices = await prisma.monthlyInvoice.findMany({
        where: {
            studentId,
            status: { in: ['PAID'] } // Can include others if needed
        },
        select: { month: true, year: true }
    });

    // Check for Active Custom Plan
    const activePlan = student.planHistory[0]?.plan;
    if (activePlan) {
        return { success: true, amount: activePlan.monthlyFee, paidMonths: paidInvoices };
    }

    // Check Academic Structure
    const enrollment = student.enrollments[0];
    if (enrollment && enrollment.batch) {
        const batch = enrollment.batch;
        const dept = batch.department;
        const course = batch.department.course;

        const { monthlyAmount } = calculateApplicableFees(student, batch, dept, course);
        return {
            success: true,
            amount: monthlyAmount,
            paidMonths: paidInvoices,
            enrollmentStart: batch.startDate,
            enrollmentEnd: batch.endDate
        };
    }

    return { success: true, amount: 0, paidMonths: paidInvoices };
}

/**
 * Logic to ensure a student has an invoice for the current month.
 * Can be called during student creation or bulk generation.
 */
export async function syncStudentMonthlyInvoice(studentId: string) {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // 1. Get student with all fee-related data
    const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
            enrollments: {
                include: {
                    batch: {
                        include: {
                            department: {
                                include: { course: true }
                            }
                        }
                    }
                },
                orderBy: { joinedAt: 'desc' },
                take: 1
            },
            planHistory: {
                include: { plan: true },
                orderBy: { startDate: 'desc' },
                take: 1
            }
        }
    });

    if (!student || !student.activeStatus) return { success: false, error: "Student not found or inactive" };

    // 2. Calculate current target amount
    let monthlyAmount = 0;
    let admissionAmount = 0;
    let planId: string | null = null;

    // A. Check for Active Custom Plan
    const activePlan = student.planHistory[0]?.plan;
    if (activePlan) {
        monthlyAmount = activePlan.monthlyFee;
        planId = activePlan.id;
    } else {
        // B. Use Academic Structure Fee
        const enrollment = student.enrollments[0];
        if (enrollment && enrollment.batch) {
            const batch = enrollment.batch;
            const dept = batch.department;
            const course = batch.department.course;

            const fees = calculateApplicableFees(student, batch, dept, course);
            monthlyAmount = fees.monthlyAmount;

            const totalInvoices = await prisma.monthlyInvoice.count({ where: { studentId } });
            if (totalInvoices === 0 || (totalInvoices === 1 && (await prisma.monthlyInvoice.findFirst({ where: { studentId, month, year } })))) {
                admissionAmount = fees.admissionAmount;
            }
        }
    }

    const totalAmount = monthlyAmount + admissionAmount;

    // 3. Check if invoice already exists for this month
    const exists = await prisma.monthlyInvoice.findFirst({
        where: {
            studentId,
            month,
            year
        }
    });

    if (exists) {
        // If unpaid and amount is wrong, update it
        if (exists.status === 'UNPAID' && (exists.amount !== totalAmount || exists.planId !== planId)) {
            await prisma.monthlyInvoice.update({
                where: { id: exists.id },
                data: {
                    amount: totalAmount,
                    planId: planId as any
                }
            });
            return { success: true, updated: true };
        }
        return { success: true, alreadyExisted: true };
    }

    // 4. Create Invoice if amount > 0
    if (totalAmount > 0) {
        const invoice = await prisma.monthlyInvoice.create({
            data: {
                studentId,
                month,
                year,
                amount: totalAmount,
                planId: planId as any,
                dueDate: new Date(year, month - 1, 10),
                status: 'UNPAID'
            }
        });
        return { success: true, created: true, invoice };
    }

    return { success: true, skipped: true, reason: "Zero total amount" };
}

export async function generateMonthlyInvoices() {
    try {
        // Get all active students
        const students = await prisma.studentProfile.findMany({
            where: { activeStatus: true },
            select: { id: true }
        });

        let createdCount = 0;
        let updatedCount = 0;
        let existedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const student of students) {
            try {
                const res = await syncStudentMonthlyInvoice(student.id);
                if (res && res.success) {
                    if ((res as any).created) createdCount++;
                    else if ((res as any).updated) updatedCount++;
                    else if ((res as any).alreadyExisted) existedCount++;
                    else if ((res as any).skipped) skippedCount++;
                } else {
                    errorCount++;
                }
            } catch (err) {
                console.error(`Error for student ${student.id}:`, err);
                errorCount++;
            }
        }

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/billing");

        const result = {
            success: true,
            created: createdCount,
            updated: updatedCount,
            existed: existedCount,
            skipped: skippedCount,
            errors: errorCount,
            total: students.length
        };

        if (createdCount > 0 || updatedCount > 0) {
            await logAdminAction("GENERATE_INVOICES", "MonthlyInvoice", "BULK", {
                created: createdCount,
                updated: updatedCount,
                totalProcessing: students.length
            });
        }

        return result;
    } catch (error) {
        console.error("Error generating invoices:", error);
        return { success: false, error: "Failed to generate invoices" };
    }
}

export async function getStudentInvoices(studentId: string) {
    try {
        const invoices = await prisma.monthlyInvoice.findMany({
            where: { studentId },
            include: {
                transactions: true,
                plan: true
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        });
        return invoices;
    } catch (error) {
        console.error("Error fetching student invoices:", error);
        return [];
    }
}

export async function getInvoiceById(id: string) {
    try {
        const invoice = await prisma.monthlyInvoice.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        enrollments: {
                            include: {
                                batch: {
                                    include: {
                                        department: {
                                            include: { course: true }
                                        }
                                    }
                                }
                            }
                        },
                        department: {
                            include: { course: true }
                        },
                        user: {
                            select: { email: true }
                        }
                    }
                },
                plan: true,
                transactions: true
            }
        });
        return invoice;
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return null;
    }
}
