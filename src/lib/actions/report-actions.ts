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

    const fundBreakdown = await prisma.ledgerTransaction.groupBy({
        by: ['fundType'],
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

    return {
        totalCollection: currentMonthCollections._sum.amount || 0,
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

    const totalStudents = await prisma.studentProfile.count(); // Total Students
    const totalTeachers = await prisma.teacherProfile.count(); // Total Teachers

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

    // Active Batches (Sessions created today?) Or just Courses?
    // Let's count Courses for now as "Batches" roughly
    const activeBatches = await prisma.batch.count({
        where: {
            active: true
        }
    });

    return {
        totalStudents,
        totalTeachers,
        totalRevenue: revenue._sum.amount || 0,
        activeBatches
    }
}
