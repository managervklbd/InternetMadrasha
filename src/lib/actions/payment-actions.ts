"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { initiateSSLPayment } from "@/lib/payment/sslcommerz";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export async function initiateInvoicePayment(invoiceIds: string[]) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        const profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true, fullName: true, phoneNumber: true, user: { select: { email: true } } }
        });
        if (!profile) throw new Error("Student profile not found.");

        const finalInvoiceIds: string[] = [];

        for (const id of invoiceIds) {
            if (id.startsWith("ADV-")) {
                const [_, monthStr, yearStr] = id.split("-");
                const month = parseInt(monthStr);
                const year = parseInt(yearStr);

                // Check if already exists (parity check)
                const existing = await prisma.monthlyInvoice.findFirst({
                    where: { studentId: profile.id, month, year }
                });

                if (existing) {
                    if (existing.status === "UNPAID") finalInvoiceIds.push(existing.id);
                } else {
                    // Create on the fly
                    const { calculateStudentMonthlyFee } = await import("./student-portal-actions");
                    const { amount, planId } = await calculateStudentMonthlyFee(profile.id);

                    if (amount > 0) {
                        const newInvoice = await prisma.monthlyInvoice.create({
                            data: {
                                student: { connect: { id: profile.id } },
                                ...(planId ? { plan: { connect: { id: planId } } } : {}),
                                month,
                                year,
                                amount,
                                status: "UNPAID",
                                dueDate: new Date(year, month - 1, 10),
                                issuedAt: new Date()
                            }
                        });
                        finalInvoiceIds.push(newInvoice.id);
                    }
                }
            } else {
                finalInvoiceIds.push(id);
            }
        }

        if (finalInvoiceIds.length === 0) {
            return { success: false, error: "কোন ইনভয়েস নির্বাচন করা হয়নি" };
        }

        const invoices = await prisma.monthlyInvoice.findMany({
            where: {
                id: { in: finalInvoiceIds },
                studentId: profile.id,
                status: "UNPAID",
            },
            include: {
                student: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (invoices.length === 0) throw new Error("No valid invoices found");

        const unpaidInvoices = invoices.filter(inv => inv.status !== "PAID");
        if (unpaidInvoices.length === 0) throw new Error("All selected invoices are already paid");

        const totalAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const firstStudent = unpaidInvoices[0].student;
        const tran_id = `TRAN_${uuidv4().substring(0, 8)}_${Date.now()}`;

        // Prepare payment data
        const paymentData = {
            total_amount: totalAmount,
            currency: "BDT",
            tran_id: tran_id,
            product_category: "Education",
            product_name: unpaidInvoices.length === 1
                ? `Monthly Fee - ${unpaidInvoices[0].month}/${unpaidInvoices[0].year}`
                : `Multi-Month Fees (${unpaidInvoices.length} Months)`,
            cus_name: firstStudent.fullName,
            cus_email: firstStudent.user.email || "student@internetmadrasha.com",
            cus_add1: "Dhaka",
            cus_city: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: firstStudent.phoneNumber || "01700000000",
            value_a: unpaidInvoices.map(inv => inv.id).join(","), // Pass all invoice IDs
            value_b: session.user.id,
        };

        const result = await initiateSSLPayment(paymentData);

        if (result.success && result.url) {
            return { success: true, url: result.url };
        } else {
            return { success: false, error: result.error || "Failed to initiate payment" };
        }
    } catch (error: any) {
        console.error("Payment initiation error:", error);
        return { success: false, error: error.message || "Internal server error" };
    }
}

export async function recordManualPayment(data: {
    studentId: string;
    months: { month: number; year: number }[];
    amount: number; // User confirmed total amount
    reference?: string;
    description?: string;
    paymentMethod?: "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING";
}) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    if (!data.studentId || data.months.length === 0) {
        return { success: false, error: "Invalid data" };
    }

    try {
        const student = await prisma.studentProfile.findUnique({
            where: { id: data.studentId },
            include: { user: true }
        });

        if (!student) throw new Error("Student not found");

        const paidInvoiceIds: string[] = [];
        const { calculateStudentMonthlyFee } = await import("./student-portal-actions");

        for (const m of data.months) {
            // Find or Create Invoice
            let invoice = await prisma.monthlyInvoice.findUnique({
                where: {
                    studentId_month_year: {
                        studentId: data.studentId,
                        month: m.month,
                        year: m.year
                    }
                }
            });

            if (!invoice) {
                // Create new
                const { amount, planId } = await calculateStudentMonthlyFee(data.studentId);

                invoice = await prisma.monthlyInvoice.create({
                    data: {
                        studentId: data.studentId,
                        planId: planId,
                        month: m.month,
                        year: m.year,
                        amount: amount,
                        status: "UNPAID",
                        dueDate: new Date(m.year, m.month - 1, 10),
                        issuedAt: new Date()
                    }
                });
            }

            // Update to PAID
            if (invoice.status !== "PAID") {
                await prisma.monthlyInvoice.update({
                    where: { id: invoice.id },
                    data: { status: "PAID" }
                });
                paidInvoiceIds.push(invoice.id);
            }
        }

        const tran_id = `MANUAL_${uuidv4().substring(0, 8)}`;

        const invoices = await prisma.monthlyInvoice.findMany({
            where: { id: { in: paidInvoiceIds } }
        });

        for (const invoice of invoices) {
            await prisma.ledgerTransaction.create({
                data: {
                    amount: invoice.amount,
                    fundType: "MONTHLY",
                    transactionDate: new Date(),
                    referenceId: data.reference || tran_id, // Same ref links them
                    description: `Manual Payment (${data.paymentMethod || "CASH"}): ${invoice.month}/${invoice.year}. ${data.description || ""}`,
                    dr_cr: "CR",
                    invoiceId: invoice.id
                }
            });
        }

        if (student.user?.email) {
            const items = invoices.map(inv => ({
                description: `Monthly Fee - ${new Date(inv.year, inv.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                amount: inv.amount
            }));

            // Async call - don't block response
            import("@/lib/mail").then(({ sendPaymentConfirmationEmail }) => {
                sendPaymentConfirmationEmail(
                    student.user.email,
                    student.fullName,
                    data.amount,
                    tran_id,
                    items
                ).catch(err => console.error("Failed to send payment email:", err));
            });

            // Send WhatsApp if student has WhatsApp number
            if (student.whatsappNumber) {
                import("@/lib/whatsapp").then(({ sendPaymentConfirmationWhatsApp }) => {
                    sendPaymentConfirmationWhatsApp(
                        student.whatsappNumber!,
                        student.fullName,
                        data.amount,
                        tran_id,
                        items
                    ).catch(err => console.error("Failed to send payment WhatsApp:", err));
                });
            }
        }

        revalidatePath("/admin/billing");
        revalidatePath(`/admin/students/${data.studentId}`);

        return { success: true };

    } catch (error: any) {
        console.error("Manual Payment Error:", error);
        return { success: false, error: error.message };
    }
}
