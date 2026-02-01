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
            },
            department: {
                include: { course: true }
            },
            enrollments: {
                include: { batch: true },
                orderBy: { joinedAt: "desc" },
                take: 1
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
            batch: {
                include: {
                    teachers: true,
                    department: {
                        include: {
                            course: true
                        }
                    },
                    liveClasses: {
                        where: {
                            active: true,
                            month: now.getMonth() + 1,
                            year: now.getFullYear()
                        },
                        take: 1
                    }
                }
            }
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

    // 6. Get Subjects for Enrolled Batches
    const subjects = await prisma.subject.findMany({
        where: {
            batchSubjects: {
                some: {
                    batch: {
                        enrollments: {
                            some: { studentId: profile.id }
                        }
                    }
                }
            }
        }
    });

    // 7. Get Monthly Live Classes (Only for Online Students)
    let onlineLiveClasses: any[] = [];
    if (profile.mode === "ONLINE") {
        const batchIds = profile.enrollments.map(e => e.batchId);

        // Strict Invoice Check for Monthly Live Class Access
        const invoice = await prisma.monthlyInvoice.findFirst({
            where: {
                studentId: profile.id,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                status: "PAID"
            }
        });

        if (invoice) {
            const monthlyClasses = await prisma.monthlyLiveClass.findMany({
                where: {
                    batchId: { in: batchIds },
                    // gender: profile.gender, // Optional constraint if strict gender separation needed
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                    active: true
                },
                include: {
                    batch: true,
                    teacher: true
                }
            });

            const sessionConfigs = await prisma.liveClassSessionConfig.findMany();

            onlineLiveClasses = monthlyClasses.map(cls => ({
                ...cls,
                sessionDetails: (cls.sessionKeys || []).map(key => sessionConfigs.find(c => c.key === key)).filter(Boolean)
            }));
        }
    }

    return {
        profile,
        latestInvoice,
        sessions,
        homework,
        homeworkCount: homework.length,
        attendanceToday,
        monthlyFee,
        currentPlanName,
        subjects,
        onlineLiveClasses
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
        // Skip self-healing for Admission Fee (month 0)
        if (inv.month === 0) continue;

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

export async function getStudentRecentPayments() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const profile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
    });

    if (!profile) throw new Error("Student profile not found");

    return prisma.sSLCommerzTransaction.findMany({
        where: {
            invoice: {
                studentId: profile.id
            }
        },
        orderBy: {
            tranDate: 'desc'
        },
        take: 10
    });
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
        if (s.mode === "OFFLINE") {
            if (s.feeTier === "SADKA") {
                amount = b.sadkaFeeOffline ?? d.sadkaFeeOffline ?? c.sadkaFeeOffline ?? b.sadkaFee ?? d.sadkaFee ?? c.sadkaFee ?? 0;
            } else {
                amount = b.monthlyFeeOffline ?? d.monthlyFeeOffline ?? c.monthlyFeeOffline ?? b.monthlyFee ?? d.monthlyFee ?? c.monthlyFee ?? 0;
            }
        } else {
            // ONLINE Default
            if (s.feeTier === "SADKA") {
                amount = b.sadkaFee ?? d.sadkaFee ?? c.sadkaFee ?? 0;
            } else {
                amount = b.monthlyFee ?? d.monthlyFee ?? c.monthlyFee ?? 0;
            }
        }
        return { amount, planId: null };
    }

    return { amount: 0, planId: null };
}

export async function getStudentAttendanceHistory() {
    const profile = await getStudentProfile();

    const attendance = await prisma.attendance.findMany({
        where: {
            studentId: profile.id
        },
        orderBy: {
            classSession: {
                date: 'desc'
            }
        },
        include: {
            classSession: {
                include: {
                    batch: true
                }
            }
        }
    });

    const stats = {
        present: attendance.filter(a => a.status === 'PRESENT').length,
        absent: attendance.filter(a => a.status === 'ABSENT').length,
        late: attendance.filter(a => a.status === 'LATE').length,
        total: attendance.length
    };

    return { attendance, stats };
}

export async function getHomeworkDetail(homeworkId: string) {
    const profile = await getStudentProfile();

    const homework = await prisma.homework.findUnique({
        where: { id: homeworkId },
        include: {
            teacher: true,
            batch: true,
            submissions: {
                where: { studentId: profile.id },
                orderBy: { submittedAt: 'desc' },
                take: 1
            }
        }
    });

    if (!homework) throw new Error("Homework not found");

    // Verify student is enrolled in the batch
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId: profile.id,
            batchId: homework.batchId
        }
    });

    if (!enrollment) throw new Error("Unauthorized access to homework");

    return homework;
}

export async function submitHomework(data: { homeworkId: string, content?: string, fileUrls?: string[] }) {
    const profile = await getStudentProfile();

    const homework = await prisma.homework.findUnique({ where: { id: data.homeworkId } });
    if (!homework) throw new Error("Homework not found");

    return prisma.homeworkSubmission.create({
        data: {
            homeworkId: data.homeworkId,
            studentId: profile.id,
            content: data.content,
            fileUrls: data.fileUrls || []
        }
    });
}

export async function getStudentHomeworks() {
    const profile = await getStudentProfile();

    const homeworks = await prisma.homework.findMany({
        where: {
            batch: {
                enrollments: {
                    some: {
                        studentId: profile.id
                    }
                }
            }
        },
        include: {
            batch: true,
            submissions: {
                where: {
                    studentId: profile.id
                },
                take: 1
            }
        },
        orderBy: {
            deadline: 'asc'
        }
    });

    return homeworks;
}
