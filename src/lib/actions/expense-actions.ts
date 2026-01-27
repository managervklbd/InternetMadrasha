"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { FundType, PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createExpense(data: {
    category: FundType;
    amount: number;
    description: string;
    date: Date;
    paymentMethod?: PaymentMethod;
    receiptNumber?: string;
    vendor?: string;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const { category, amount, description, date, paymentMethod, receiptNumber, vendor, notes } = data;

    return await prisma.$transaction(async (tx) => {
        // 1. Create Ledger Transaction (DR for Expense)
        const ledgerEntry = await tx.ledgerTransaction.create({
            data: {
                fundType: category,
                amount: amount,
                dr_cr: "DR",
                description: `Expense: ${description}`,
                transactionDate: date,
                referenceId: receiptNumber,
            },
        });

        // 2. Create Expense Record
        const expense = await tx.expense.create({
            data: {
                category,
                amount,
                description,
                date,
                paymentMethod,
                receiptNumber,
                vendor,
                notes,
                createdBy: session.user.id,
                ledgerEntryId: ledgerEntry.id,
            },
        });

        return expense;
    });
}

export async function updateExpense(id: string, data: {
    category?: FundType;
    amount?: number;
    description?: string;
    date?: Date;
    paymentMethod?: PaymentMethod;
    receiptNumber?: string;
    vendor?: string;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return await prisma.$transaction(async (tx) => {
        const existingExpense = await tx.expense.findUnique({
            where: { id },
        });

        if (!existingExpense) throw new Error("Expense not found");

        // Update Expense
        const expense = await tx.expense.update({
            where: { id },
            data,
        });

        // Update Ledger Transaction if amount, category or date changed
        if (data.amount !== undefined || data.category !== undefined || data.date !== undefined || data.description !== undefined) {
            await tx.ledgerTransaction.update({
                where: { id: existingExpense.ledgerEntryId },
                data: {
                    fundType: data.category ?? undefined,
                    amount: data.amount ?? undefined,
                    transactionDate: data.date ?? undefined,
                    description: data.description ? `Expense: ${data.description}` : undefined,
                },
            });
        }

        return expense;
    });
}

export async function deleteExpense(id: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return await prisma.$transaction(async (tx) => {
        const expense = await tx.expense.findUnique({
            where: { id },
        });

        if (!expense) throw new Error("Expense not found");

        // Delete Expense
        await tx.expense.delete({
            where: { id },
        });

        // Delete Ledger Transaction
        await tx.ledgerTransaction.delete({
            where: { id: expense.ledgerEntryId },
        });

        return { success: true };
    });
}

export async function getExpenses(filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: FundType;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const where: any = {};
    if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
    }
    if (filters?.category) {
        where.category = filters.category;
    }

    const expenses = await prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return { expenses, total };
}

export async function getExpenseStatsByMonth(year: number) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const expenses = await prisma.expense.findMany({
        where: {
            date: {
                gte: new Date(year, 0, 1),
                lte: new Date(year, 11, 31),
            },
        },
    });

    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: 0,
    }));

    expenses.forEach((e) => {
        const month = e.date.getMonth();
        monthlyStats[month].total += e.amount;
    });

    return monthlyStats;
}
