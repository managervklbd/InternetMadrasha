import { prisma } from "@/lib/db";
import { FundType, InvoiceStatus } from "@prisma/client";

export const billingService = {
    /**
     * Generates invoices for all active students for a given month/year.
     */
    async generateMonthlyInvoices(month: number, year: number) {
        const students = await prisma.studentProfile.findMany({
            where: { activeStatus: true },
            include: {
                planHistory: {
                    where: { endDate: null },
                    include: { plan: true }
                }
            },
        });

        const results = [];

        for (const student of students) {
            const activePlan = student.planHistory[0]?.plan;
            if (!activePlan) continue;

            const invoice = await prisma.monthlyInvoice.upsert({
                where: {
                    studentId_month_year: {
                        studentId: student.id,
                        month,
                        year,
                    },
                },
                update: {}, // Don't change existing invoices
                create: {
                    studentId: student.id,
                    month,
                    year,
                    amount: activePlan.monthlyFee,
                    planId: activePlan.id,
                    status: InvoiceStatus.UNPAID,
                    dueDate: new Date(year, month - 1, 10), // Default to 10th of the month
                },
            });
            results.push(invoice);
        }

        return results;
    },

    /**
     * Records a validated payment from SSLCOMMERZ.
     */
    async recordPayment(data: {
        invoiceId: string;
        tranId: string;
        amount: number;
        fundType: FundType;
        rawResponse?: any;
    }) {
        return prisma.$transaction(async (tx) => {
            // 1. Create Transaction Reference
            await tx.sSLCommerzTransaction.create({
                data: {
                    invoiceId: data.invoiceId,
                    tranId: data.tranId,
                    amount: data.amount,
                    tranDate: new Date(),
                    status: "VALIDATED",
                    rawResponse: data.rawResponse,
                    storeId: process.env.SSLCOMMERZ_STORE_ID || "test",
                },
            });

            // 2. Mark Invoice as PAID
            const invoice = await tx.monthlyInvoice.update({
                where: { id: data.invoiceId },
                data: { status: InvoiceStatus.PAID },
            });

            // 3. Create Ledger Entry (Fund Isolation)
            await tx.ledgerTransaction.create({
                data: {
                    fundType: data.fundType,
                    amount: data.amount,
                    dr_cr: "CR", // Credit to the fund
                    description: `Monthly Fee Payment - Invoice ID: ${data.invoiceId}`,
                    invoiceId: data.invoiceId,
                    referenceId: data.tranId,
                },
            });

            return invoice;
        });
    },

    async getFundBalances() {
        const results = await prisma.ledgerTransaction.groupBy({
            by: ["fundType"],
            _sum: {
                amount: true,
            },
        });
        return results;
    },
};
