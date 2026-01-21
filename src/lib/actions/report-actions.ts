"use server";

import { prisma } from "@/lib/db";
import { InvoiceStatus, FundType } from "@prisma/client";

export async function getFinancialSummary() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthCollections = await prisma.ledgerTransaction.aggregate({
        where: {
            transactionDate: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth,
            },
            dr_cr: "CR",
        },
        _sum: {
            amount: true,
        },
    });

    const pendingInvoices = await prisma.monthlyInvoice.aggregate({
        where: {
            status: InvoiceStatus.UNPAID,
        },
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        }
    });

    const totalCollectionsResult = await prisma.ledgerTransaction.aggregate({
        where: {
            dr_cr: "CR",
        },
        _sum: {
            amount: true,
        },
    });

    const fundBreakdown = await prisma.ledgerTransaction.groupBy({
        by: ['fundType'],
        where: {
            dr_cr: "CR",
        },
        _sum: {
            amount: true,
        },
    });

    return {
        totalCollection: currentMonthCollections._sum.amount || 0,
        allTimeTotal: totalCollectionsResult._sum.amount || 0,
        totalPending: pendingInvoices._sum.amount || 0,
        pendingCount: pendingInvoices._count.id || 0,
        fundBreakdown: fundBreakdown.map(f => ({
            fundType: f.fundType,
            amount: f._sum.amount || 0,
        })),
    };
}

export async function getRevenueTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const transactions = await prisma.ledgerTransaction.findMany({
        where: {
            transactionDate: {
                gte: sixMonthsAgo,
            },
            dr_cr: "CR",
        },
        select: {
            transactionDate: true,
            amount: true,
        }
    });

    const trendMap = new Map<string, number>();

    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        trendMap.set(key, 0);
    }

    transactions.forEach(t => {
        const d = new Date(t.transactionDate);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (trendMap.has(key)) {
            trendMap.set(key, (trendMap.get(key) || 0) + t.amount);
        }
    });

    const data = Array.from(trendMap.entries()).map(([key, amount]) => {
        const [year, month] = key.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const label = dateObj.toLocaleDateString('bn-BD', { month: 'short', year: '2-digit' });

        return {
            name: label,
            amount: amount,
            sortKey: dateObj.getTime(),
        };
    }).sort((a, b) => a.sortKey - b.sortKey);

    return data;
}

export async function getStudentDemographics() {
    const totalStudents = await prisma.studentProfile.count();
    const activeStudents = await prisma.studentProfile.count({ where: { activeStatus: true } });

    const genderData = await prisma.studentProfile.groupBy({
        by: ['gender'],
        _count: {
            id: true,
        }
    });

    const residencyData = await prisma.studentProfile.groupBy({
        by: ['residency'],
        _count: {
            id: true,
        }
    });

    const modeData = await prisma.studentProfile.groupBy({
        by: ['mode'],
        _count: {
            id: true,
        }
    });

    return {
        stats: {
            total: totalStudents,
            active: activeStudents,
            inactive: totalStudents - activeStudents,
        },
        gender: genderData.map(g => ({ name: g.gender, value: g._count.id })),
        residency: residencyData.map(r => ({ name: r.residency, value: r._count.id })),
        mode: modeData.map(m => ({ name: m.mode, value: m._count.id })),
    };
}

export async function getAttendanceStats() {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const todayStats = await prisma.attendance.groupBy({
        by: ['status'],
        where: {
            classSession: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        },
        _count: {
            id: true,
        }
    });

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthAttendance = await prisma.attendance.findMany({
        where: {
            status: 'PRESENT',
            classSession: {
                date: {
                    gte: firstDayOfMonth
                }
            }
        },
        select: {
            classSession: {
                select: {
                    date: true
                }
            }
        }
    });

    const dailyMap = new Map<string, number>();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), i);
        if (d > new Date()) break;
        const key = d.toISOString().split('T')[0];
        dailyMap.set(key, 0);
    }

    monthAttendance.forEach(a => {
        const key = a.classSession.date.toISOString().split('T')[0];
        if (dailyMap.has(key)) {
            dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
        }
    });

    const trend = Array.from(dailyMap.entries()).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }),
        count
    }));

    return {
        today: todayStats.map(s => ({ status: s.status, count: s._count.id })),
        monthTrend: trend
    };
}

export async function getAdminOverviewStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalStudents = await prisma.studentProfile.count();
    const totalTeachers = await prisma.teacherProfile.count();

    const revenue = await prisma.ledgerTransaction.aggregate({
        where: {
            transactionDate: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth,
            },
            dr_cr: "CR",
        },
        _sum: {
            amount: true,
        },
    });

    const activeBatches = await prisma.batch.count({
        where: {
            active: true
        }
    });

    // Fetch Recent Activities
    const recentEnrollments = await prisma.enrollment.findMany({
        take: 2,
        orderBy: { joinedAt: 'desc' },
        include: {
            student: true,
            batch: {
                include: { department: true }
            }
        }
    });

    const recentTransactions = await prisma.ledgerTransaction.findMany({
        take: 2,
        where: { dr_cr: "CR" },
        orderBy: { transactionDate: 'desc' },
        include: {
            invoice: {
                include: { student: true }
            }
        }
    });

    const activities = [
        ...recentEnrollments.map(e => ({
            id: `en-${e.id}`,
            type: 'ENROLLMENT' as const,
            title: e.student.fullName,
            subtitle: `${e.batch.department.name} - ${e.batch.name}`,
            date: e.joinedAt,
        })),
        ...recentTransactions.map(t => {
            let title = t.invoice?.student?.fullName || 'Anonymous';
            let subtitle = '';

            if (t.fundType === 'MONTHLY') {
                subtitle = 'মাসিক ফি';
            } else if (t.fundType === 'ADMISSION') {
                subtitle = 'ভর্তি ফি';
            } else if (t.fundType === 'DONATION') {
                subtitle = 'দান (লিল্লাহ)';
                if (t.description?.includes('Donation: ')) {
                    title = t.description.split(' (')[0].replace('Donation: ', '');
                } else if (t.description?.includes('Sync: Donation from ')) {
                    title = t.description.replace('Sync: Donation from ', '');
                }
            } else if (t.fundType === 'DANA_COMMITTEE') {
                subtitle = 'কমিটি দান';
                if (t.description?.includes('Donation: ')) {
                    title = t.description.split(' (')[0].replace('Donation: ', '');
                } else if (t.description?.includes('Sync: Donation from ')) {
                    title = t.description.replace('Sync: Donation from ', '');
                }
            }

            return {
                id: `tx-${t.id}`,
                type: 'TRANSACTION' as const,
                title: title === 'Anonymous' && t.description ? t.description : title,
                subtitle: `${subtitle} - ৳${t.amount}`,
                date: t.transactionDate,
            };
        })
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3);

    return {
        totalStudents,
        totalTeachers,
        totalRevenue: revenue._sum.amount || 0,
        activeBatches,
        activities
    }
}
export async function getStudentPaymentHistory() {
    try {
        return await prisma.ledgerTransaction.findMany({
            where: {
                fundType: {
                    in: [FundType.MONTHLY, FundType.ADMISSION]
                },
                dr_cr: "CR"
            },
            include: {
                invoice: {
                    include: {
                        student: {
                            include: {
                                department: {
                                    include: {
                                        course: true
                                    }
                                }
                            }
                        },
                        plan: true
                    }
                }
            },
            orderBy: {
                transactionDate: 'desc'
            },
            take: 100
        });
    } catch (error) {
        console.error("Error getting payment history:", error);
        return [];
    }
}

export async function exportFinancialReport() {
    try {
        const transactions = await prisma.ledgerTransaction.findMany({
            where: {
                dr_cr: "CR"
            },
            orderBy: {
                transactionDate: 'desc'
            },
            include: {
                invoice: {
                    include: {
                        student: true
                    }
                }
            }
        });

        // Generate CSV header with BOM for Excel UTF-8 support
        let csv = "\uFEFFDate,Reference,Fund Type,Amount,Student Name,Student ID,Description\n";

        // Generate CSV rows
        transactions.forEach(t => {
            const date = new Date(t.transactionDate).toLocaleDateString("bn-BD");
            const reference = t.referenceId || "N/A";
            const fundType = t.fundType;
            const amount = t.amount;
            let name = t.invoice?.student?.fullName || "Anonymous";
            const studentID = t.invoice?.student?.studentID || "N/A";
            const description = t.description?.replace(/,/g, " ") || "";

            // Fallback for donations/other transactions where student name is missing
            if (name === "Anonymous" && description.includes("Donation:")) {
                const match = description.match(/Donation: (.*?) \(/);
                if (match && match[1]) {
                    name = match[1];
                }
            } else if (name === "Anonymous" && description && description.includes(":")) {
                // Generic fallback: use description if it seems like a name or title
                name = description.split(":")[0].trim();
            }

            csv += `${date},${reference},${fundType},${amount},"${name}",${studentID},"${description}"\n`;
        });

        return { success: true, csv };
    } catch (error) {
        console.error("Error exporting report:", error);
        return { success: false, error: "Failed to generate export" };
    }
}

export async function getRecentTransactions(limit: number = 10) {
    try {
        return await prisma.ledgerTransaction.findMany({
            where: {
                dr_cr: "CR"
            },
            take: limit,
            orderBy: {
                transactionDate: 'desc'
            },
            include: {
                invoice: {
                    include: {
                        student: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error getting recent transactions:", error);
        return [];
    }
}
