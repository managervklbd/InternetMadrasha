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
 * Helper to calculate applicable monthly and admission fees based on student mode and tier.
 */
async function calculateApplicableFees(student: any, batch: any, department: any, course: any) {
    let monthlyAmount = 0;
    let admissionAmount = 0;

    const isOffline = student.mode === "OFFLINE";
    const isProbashi = student.residency === "PROBASHI";

    if (isProbashi) {
        // Probashi (Foreign) Logic - No Tier Overrides implemented for Probashi yet (per requirement)
        monthlyAmount = batch.monthlyFeeProbashi ?? department.monthlyFeeProbashi ?? course.monthlyFeeProbashi ?? 0;
        admissionAmount = batch.admissionFeeProbashi ?? department.admissionFeeProbashi ?? course.admissionFeeProbashi ?? 0;
    } else {
        // Local Logic (Online/Offline) with Fee Tier Overrides check
        let tierOverride: any = null;

        if (student.feeTierId) { // If student has a specific tier assigned
            // findMostSpecificOverride
            const overrides = await prisma.academicTierFee.findMany({
                where: {
                    tierId: student.feeTierId,
                    OR: [
                        { batchId: batch.id },
                        { departmentId: department.id },
                        { courseId: course.id }
                    ]
                }
            });

            // Specificity: Batch > Dept > Course
            tierOverride = overrides.find(o => o.batchId === batch.id)
                || overrides.find(o => o.departmentId === department.id)
                || overrides.find(o => o.courseId === course.id);
        }

        if (isOffline) {
            // Offline
            if (tierOverride) {
                // Use override if exists.
                monthlyAmount = tierOverride.monthlyFeeOffline ?? 0;
                admissionAmount = tierOverride.admissionFeeOffline ?? 0;
            } else {
                // Fallback to General
                monthlyAmount = batch.monthlyFeeOffline ?? department.monthlyFeeOffline ?? course.monthlyFeeOffline ?? 0;
                admissionAmount = batch.admissionFeeOffline ?? department.admissionFeeOffline ?? course.admissionFeeOffline ?? 0;
            }
        } else {
            // Online
            if (tierOverride) {
                monthlyAmount = tierOverride.monthlyFee ?? 0;
                admissionAmount = tierOverride.admissionFee ?? 0;
            } else {
                monthlyAmount = batch.monthlyFee ?? department.monthlyFee ?? course.monthlyFee ?? 0;
                admissionAmount = batch.admissionFee ?? department.admissionFee ?? course.admissionFee ?? 0;
            }
        }
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
    const latestHistory = student.planHistory[0];
    const activePlan = (latestHistory && !latestHistory.endDate) ? latestHistory.plan : null;

    if (activePlan) {
        return { success: true, amount: activePlan.monthlyFee, paidMonths: paidInvoices };
    }

    // Check Academic Structure
    const enrollment = student.enrollments[0];
    if (enrollment && enrollment.batch) {
        const batch = enrollment.batch;
        const dept = batch.department;
        const course = batch.department.course;

        const { monthlyAmount, admissionAmount } = await calculateApplicableFees(student, batch, dept, course);

        return {
            success: true,
            amount: monthlyAmount,
            admissionAmount,
            isAdmissionFeePaid: enrollment.isAdmissionFeePaid,
            paidMonths: paidInvoices,
            enrollmentStart: batch.startDate,
            enrollmentEnd: batch.endDate,
            courseDuration: course.durationMonths
        };
    }

    return { success: true, amount: 0, admissionAmount: 0, isAdmissionFeePaid: true, paidMonths: paidInvoices };
}

/**
 * Logic to ensure a student has an invoice for the current month.
 * Can be called during student creation or bulk generation.
 */
export async function syncStudentMonthlyInvoice(studentId: string) {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

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

    // 2. Logic Selection: Custom Plan vs Academic Structure
    let targetAmount = 0;
    let targetMonth = currentMonth;
    let targetYear = currentYear;
    let planId: string | null = null;
    let isAdmissionInvoice = false;

    // A. Check for Active Custom Plan
    const latestHistory = student.planHistory[0];
    const activePlan = (latestHistory && !latestHistory.endDate) ? latestHistory.plan : null;

    if (activePlan) {
        targetAmount = activePlan.monthlyFee;
        planId = activePlan.id;
    } else {
        // B. Use Academic Structure Fee
        const enrollment = student.enrollments[0];
        if (enrollment && enrollment.batch) {
            const batch = enrollment.batch;
            const dept = batch.department;
            const course = batch.department.course;

            const fees = await calculateApplicableFees(student, batch, dept, course);

            // Gatekeeping Logic: Check if Admission Fee is Paid
            if (!enrollment.isAdmissionFeePaid && fees.admissionAmount > 0) {
                // Determine if they have an active Admission Invoice
                const admissionInvoice = await prisma.monthlyInvoice.findFirst({
                    where: {
                        studentId,
                        month: 0, // Special Month for Admission Fee
                        // year: currentYear - we might reuse year, or just care about month 0
                    }
                });

                if (admissionInvoice) {
                    if (admissionInvoice.status === 'PAID') {
                        // It's paid! Update enrollment flag and proceed to monthly fee
                        await prisma.enrollment.update({
                            where: { id: enrollment.id },
                            data: { isAdmissionFeePaid: true }
                        });
                        // Recurse or fall through to monthly fee logic?
                        // For simplicity, fall through to Monthly Fee Calculation in this same execution? 
                        // No, let's process Monthly Fee below naturally after flag update.
                        targetAmount = fees.monthlyAmount;
                    } else {
                        // Not paid yet. This is the target.
                        // Ensure amount is correct (in case structure changed)
                        if (admissionInvoice.amount !== fees.admissionAmount) {
                            await prisma.monthlyInvoice.update({
                                where: { id: admissionInvoice.id },
                                data: { amount: fees.admissionAmount }
                            });
                        }
                        return { success: true, alreadyExisted: true, reason: "Pending Admission Fee" };
                    }
                } else {
                    // Create Admission Invoice
                    targetAmount = fees.admissionAmount;
                    targetMonth = 0; // 0 indicates Admission Fee
                    isAdmissionInvoice = true;
                }

            }

            // If Admission Fee is Paid (or just marked paid above), calculate Monthly Fee
            if (enrollment.isAdmissionFeePaid || fees.admissionAmount === 0 || (isAdmissionInvoice === false && targetMonth !== 0)) {
                targetAmount = fees.monthlyAmount;
                targetMonth = currentMonth;
            }
        }
    }

    if (targetAmount <= 0) {
        return { success: true, skipped: true, reason: "Zero amount" };
    }

    // 3. Check/Create Invoice
    const exists = await prisma.monthlyInvoice.findFirst({
        where: {
            studentId,
            month: targetMonth,
            year: targetYear
        }
    });

    if (exists) {
        // If unpaid and amount/plan mismatch, update it
        // Don't update if it's Admission Fee (month 0) and we just handled it logic above already? 
        // Logic above handles amount update for admission. Here handles monthly.
        if (exists.status === 'UNPAID' && (exists.amount !== targetAmount || exists.planId !== planId)) {
            await prisma.monthlyInvoice.update({
                where: { id: exists.id },
                data: {
                    amount: targetAmount,
                    planId: planId as any
                }
            });
            return { success: true, updated: true };
        }
        return { success: true, alreadyExisted: true };
    }

    // 4. Create Invoice
    const invoice = await prisma.monthlyInvoice.create({
        data: {
            studentId,
            month: targetMonth,
            year: targetYear,
            amount: targetAmount,
            planId: planId as any,
            dueDate: new Date(targetYear, targetMonth === 0 ? currentMonth : targetMonth - 1, 10), // Approx due date
            status: 'UNPAID'
        }
    });

    return { success: true, created: true, invoice };
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
