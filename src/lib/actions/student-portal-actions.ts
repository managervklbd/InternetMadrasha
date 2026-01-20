"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { InvoiceStatus } from "@prisma/client";

async function getStudentProfile() {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
        throw new Error("Unauthorized");
    }

    const profile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            planHistory: {
                where: { endDate: null },
                include: { plan: true }
            }
        }
    });

    if (!profile) throw new Error("Student profile not found");
    return profile;
}

export async function getStudentDashboardData() {
    const profile = await getStudentProfile();

    // 1. Get Latest Invoice
    const latestInvoice = await prisma.monthlyInvoice.findFirst({
        where: { studentId: profile.id },
        orderBy: { issuedAt: "desc" },
        include: { plan: true }
    });

    // 2. Get Today's Sessions for Enrolled Batches
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const sessions = await prisma.classSession.findMany({
        where: {
            batch: {
                enrollments: {
                    some: { studentId: profile.id }
                }
            },
            date: {
                gte: todayStart,
                lte: todayEnd
            }
        },
        include: {
            batch: true
        }
    });

    // 3. Get Homework (Active)
    const homework = await prisma.homework.findMany({
        where: {
            batch: {
                enrollments: {
                    some: { studentId: profile.id }
                }
            },
            deadline: { gte: new Date() }
        },
        include: {
            teacher: true,
            batch: true
        },
        orderBy: { id: "desc" },
        take: 5
    });

    // 4. Check Attendance for Today
    const attendanceToday = await prisma.attendance.findMany({
        where: {
            studentId: profile.id,
            classSession: {
                date: { gte: todayStart, lte: todayEnd }
            }
        }
    });

    // 5. Calculate Current Fee and Plan
    const { amount: monthlyFee, planId } = await calculateStudentMonthlyFee(profile.id);

    let currentPlanName = profile.feeTier === 'SADKA' ? "সদকা প্ল্যান" : "সাধারণ প্ল্যান"; // Updated default based on tier
    if (planId) {
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        currentPlanName = plan?.name || currentPlanName;
    }

    return {
        profile,
        latestInvoice,
        sessions,
        homework,
        homeworkCount: homework.length,
        attendanceToday,
        monthlyFee,
        currentPlanName
    };
}

export async function joinClass(sessionId: string) {
    const profile = await getStudentProfile();

    // Rule: Only online students can join via portal
    if (profile.mode !== "ONLINE") {
        throw new Error("Only online students can join classes via the portal.");
    }

    // Rule: Must be paid to join
    const unpaidInvoices = await prisma.monthlyInvoice.count({
        where: {
            studentId: profile.id,
            status: InvoiceStatus.UNPAID
        }
    });

    if (unpaidInvoices > 0) {
        throw new Error("Please clear your outstanding dues to join the class.");
    }

    // Auto-record attendance
    return prisma.attendance.upsert({
        where: {
            studentId_classSessionId: {
                studentId: profile.id,
                classSessionId: sessionId
            }
        },
        update: {
            joinTime: new Date()
        },
        create: {
            studentId: profile.id,
            classSessionId: sessionId,
            mode: "ONLINE",
            status: "PRESENT",
            joinTime: new Date()
        }
    });
}

export async function getStudentInvoices() {
    const profile = await getStudentProfile();
    const issued = await prisma.monthlyInvoice.findMany({
        where: { studentId: profile.id },
        orderBy: { issuedAt: "desc" },
        include: { plan: true }
    });

    const profile_with_enrollment = await prisma.studentProfile.findUnique({
        where: { id: profile.id },
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
                orderBy: { joinedAt: "desc" },
                take: 1
            }
        }
    });

    const currentBatch = profile_with_enrollment?.enrollments[0]?.batch;
    const batchStartDate = currentBatch?.startDate ? new Date(currentBatch.startDate) : null;
    let batchEndDate = currentBatch?.endDate ? new Date(currentBatch.endDate) : null;
    const durationMonths = (currentBatch as any)?.department?.course?.durationMonths;

    // Strict Billing Limit: Normalize end date to the 1st of the month AFTER the allowed duration
    if (batchStartDate && durationMonths) {
        const strictLimit = new Date(batchStartDate.getFullYear(), batchStartDate.getMonth() + durationMonths, 1);
        // Use the stricter of the two: explicitly set end date or duration-based limit
        if (!batchEndDate || strictLimit < batchEndDate) {
            batchEndDate = strictLimit;
        }
    }

    // Calculate prospective months (next 12 months)
    const upcoming = [];
    const now = new Date();
    let currentMonth = now.getMonth() + 1;
    let currentYear = now.getFullYear();

    const { amount: monthlyFee, planId } = await calculateStudentMonthlyFee(profile.id);

    // Self-healing: Update existing UNPAID invoices if they don't match the current calculation
    // This ensures that if feeTier/plan changed, the student sees the updated amount immediately.
    for (const inv of issued) {
        if (inv.status === InvoiceStatus.UNPAID && inv.amount !== monthlyFee) {
            await prisma.monthlyInvoice.update({
                where: { id: inv.id },
                data: {
                    amount: monthlyFee,
                    planId: planId as any
                }
            });
            inv.amount = monthlyFee; // Update local object for display
        }
    }

    if (monthlyFee > 0) {
        for (let i = 1; i <= 12; i++) {
            currentMonth++;
            if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
            }

            // DATE VALIDATION LOGIC
            // Construct a date object for the first day of the prospective month
            const prospectiveDate = new Date(currentYear, currentMonth - 1, 1);

            // 1. Check if batch has ended
            if (batchEndDate && prospectiveDate >= batchEndDate) {
                continue;
            }

            // Check if invoice already exists
            const exists = issued.find(inv => inv.month === currentMonth && inv.year === currentYear);
            if (!exists) {
                upcoming.push({
                    id: `ADV-${currentMonth}-${currentYear}`,
                    month: currentMonth,
                    year: currentYear,
                    amount: monthlyFee,
                    planId: planId,
                    status: "UNISSUED",
                    isAdvance: true
                });
            }
        }
    }

    return { issued, upcoming };
}

export async function calculateStudentMonthlyFee(studentId: string): Promise<{ amount: number, planId: string | null }> {
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

    if (!student || !student.activeStatus) return { amount: 0, planId: null };

    // A. Check for Active Custom Plan
    const activePlan = student.planHistory[0]?.plan;
    if (activePlan) return { amount: activePlan.monthlyFee, planId: activePlan.id };

    // B. Use Academic Structure Fee
    const enrollment = student.enrollments[0];
    if (enrollment && enrollment.batch) {
        const batch = enrollment.batch;
        const course = batch.department.course;
        const dept = batch.department;

        const s = student as any;
        const b = batch as any;
        const d = dept as any;
        const c = course as any;

        let amount = 0;
        if (s.feeTier === "SADKA") {
            amount = b.sadkaFee ?? d.sadkaFee ?? c.sadkaFee ?? 0;
        } else {
            amount = b.monthlyFee ?? d.monthlyFee ?? c.monthlyFee ?? 0;
        }
        return { amount, planId: null };
    }

    return { amount: 0, planId: null };
}
