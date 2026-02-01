import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateSSLPayment } from "@/lib/payment/sslcommerz";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    const logFile = path.join(process.cwd(), "payment.log");
    const log = (msg: string) => {
        try {
            fs.appendFileSync(logFile, `[${new Date().toLocaleString()}] ${msg}\n`);
        } catch (e) {
            console.error("Logging failed", e);
        }
    };

    try {
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries()) as any;
        log(`SUCCESS CALLBACK - Data: ${JSON.stringify(data)}`);

        const { val_id, status, tran_id, value_a: invoiceIdsRaw, amount, store_id } = data;
        const invoiceIds = invoiceIdsRaw.split(",");

        if (status !== "VALID") {
            log(`ABORT: Status is ${status}`);
            const failUrl = new URL("/student/billing?status=fail", req.url).toString();
            return new NextResponse(`<html><script>window.location.href="${failUrl}";</script></html>`, { headers: { "Content-Type": "text/html" } });
        }

        // 1. Validate with SSLCommerz server
        log(`Step 1: Validating val_id ${val_id} for Invoices: ${invoiceIdsRaw}`);
        const validation = await validateSSLPayment(val_id);
        if (!validation.success) {
            log(`ABORT: API Validation Failed - ${validation.error}`);
            const invalidUrl = new URL("/student/billing?status=invalid", req.url).toString();
            return new NextResponse(`<html><script>window.location.href="${invalidUrl}";</script></html>`, { headers: { "Content-Type": "text/html" } });
        }

        const validData = validation.data;
        log(`Step 2: Validation Data Received - Card: ${validData.card_type}`);

        // 2. Database Transaction
        await prisma.$transaction(async (tx) => {
            log(`Step 3: DB Transaction Started for ${invoiceIds.length} Invoices`);

            const isRegistration = data.value_b === "REGISTRATION";
            log(`Payment Type: ${isRegistration ? "REGISTRATION" : "MONTHLY"}`);

            for (let i = 0; i < invoiceIds.length; i++) {
                const invId = invoiceIds[i];

                // A. Update Invoice
                const invoice = await tx.monthlyInvoice.update({
                    where: { id: invId },
                    data: { status: "PAID" },
                    include: { student: true } // Need student to activate
                });

                // B. Create SSL Record (ONLY FOR THE FIRST INVOICE to avoid unique constraint)
                if (i === 0) {
                    await tx.sSLCommerzTransaction.create({
                        data: {
                            invoiceId: invId,
                            storeId: store_id,
                            tranId: tran_id,
                            valId: val_id,
                            amount: parseFloat(amount), // TOTAL amount of payment session
                            tranDate: new Date(),
                            cardType: validData.card_type,
                            status: "VALIDATED",
                            rawResponse: validData as any,
                        },
                    });
                }

                // C. Create Ledger Entry
                await tx.ledgerTransaction.create({
                    data: {
                        fundType: isRegistration ? "ADMISSION" : "MONTHLY",
                        amount: invoice.amount,
                        dr_cr: "CR",
                        description: isRegistration
                            ? `Admission Fee - ${invoice.student.fullName} (${invoice.student.studentID})`
                            : `Batch Payment (SSL) - Inv ${invoice.month}/${invoice.year}`,
                        invoiceId: invId,
                        referenceId: tran_id,
                    },
                });

                // D. [NEW] Activate Student if Registration
                if (isRegistration) {
                    log(`Activating Student: ${invoice.studentId}`);

                    // 1. Activate Profile
                    await tx.studentProfile.update({
                        where: { id: invoice.studentId },
                        data: { activeStatus: true }
                    });

                    // 2. Activate User
                    await tx.user.update({
                        where: { id: invoice.student.userId },
                        data: { status: "ACTIVE" }
                    });

                    // 3. Mark Enrollment as Paid
                    // We need to find the enrollment for this admission. 
                    // Since admission fee is batch-specific, we update the latest enrollment? 
                    // Or all unpaid enrollments? Usually just one for registration.
                    await tx.enrollment.updateMany({
                        where: { studentId: invoice.studentId },
                        data: { isAdmissionFeePaid: true }
                    });
                }
            }
            log(`Step 4: DB Transaction Complete`);
        });

        if (data.value_b === "REGISTRATION") {
            const loginUrl = new URL("/auth/login?success=registered", req.url).toString();
            return new NextResponse(
                `<html>
                    <body>
                        <p>Registration Successful! Redirecting to login...</p>
                        <script>window.location.href = "${loginUrl}";</script>
                    </body>
                </html>`,
                { headers: { "Content-Type": "text/html" } }
            );
        }

        log(`SUCCESS: Redirecting to success page`);
        const successUrl = new URL("/student/billing?status=success", req.url).toString();
        return new NextResponse(
            `<html>
                <body>
                    <p>Redirecting to dashboard...</p>
                    <script>window.location.href = "${successUrl}";</script>
                </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
        );
    } catch (error: any) {
        log(`CRITICAL ERROR: ${error.message}\n${error.stack}`);
        const errorUrl = new URL("/student/billing?status=error", req.url).toString();
        return new NextResponse(`<html><script>window.location.href="${errorUrl}";</script></html>`, { headers: { "Content-Type": "text/html" } });
    }
}
