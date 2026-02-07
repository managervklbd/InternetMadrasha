"use server";

import { prisma } from "@/lib/db";
import { initiateSSLPayment } from "@/lib/payment/sslcommerz";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PaymentMethod } from "@prisma/client";

export async function initiateDonation(amount: number, purpose: string, notes?: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
        return { success: false, error: "Unauthorized" };
    }

    const student = await prisma.studentProfile.findFirst({
        where: { userId: session.user.id }
    });

    if (!student) {
        return { success: false, error: "Student profile not found" };
    }

    if (amount < 10) {
        return { success: false, error: "Minimum donation amount is 10 BDT" };
    }

    // 1. Create a Pending Donation Record
    const tran_id = `DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
        const donation = await prisma.donation.create({
            data: {
                amount: amount,
                purpose: "DONATION",
                paymentMethod: PaymentMethod.MOBILE_BANKING,
                transactionId: tran_id,
                studentId: student.id,
                notes: notes,
                date: new Date(),
            }
        });

        // 2. Initiate SSLCommerz Payment
        const paymentData = {
            total_amount: amount,
            currency: "BDT",
            tran_id: tran_id,
            product_category: "Donation",
            product_name: `Donation by ${student.fullName}`,
            cus_name: student.fullName,
            cus_email: session.user.email,
            cus_add1: student.country || "Bangladesh",
            cus_city: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: student.phoneNumber || "01700000000",
            value_a: "DONATION", // Tag to identify this as a donation in IPN
            value_b: donation.id   // Pass Donation ID for easy retrieval
        };

        const result = await initiateSSLPayment(paymentData);

        if (result.success && result.url) {
            return { success: true, url: result.url };
        } else {
            // Delete the pending donation if payment initiation fails? 
            // Or keep it as "Failed"?
            // Let's keep it but maybe mark status if we had one. 
            // Donation model doesn't have a status field (it has `paymentMethod` and `transactionId`).
            // It might be better to delete it to avoid clutter if they retry.
            await prisma.donation.delete({ where: { id: donation.id } });
            return { success: false, error: result.error || "Payment initiation failed" };
        }

    } catch (error) {
        console.error("Donation Error:", error);
        return { success: false, error: "Failed to process donation" };
    }
}
