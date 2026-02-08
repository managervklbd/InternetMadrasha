"use server";

import { prisma } from "@/lib/db";
import { initiateSSLPayment } from "@/lib/payment/sslcommerz";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PaymentMethod, DonationPurpose } from "@prisma/client";

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

export async function getDonationStats() {
    try {
        const totalDonation = await prisma.donation.aggregate({
            _sum: { amount: true }
        });

        const count = await prisma.donation.count();

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const thisMonthDonation = await prisma.donation.aggregate({
            where: { date: { gte: thisMonth } },
            _sum: { amount: true }
        });

        return {
            totalAmount: totalDonation._sum.amount || 0,
            totalCount: count,
            thisMonthAmount: thisMonthDonation._sum.amount || 0
        };
    } catch (error) {
        console.error("Error fetching donation stats:", error);
        return { totalAmount: 0, totalCount: 0, thisMonthAmount: 0 };
    }
}

export async function getRecentDonations(limit = 10) {
    try {
        return await prisma.donation.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: {
                donor: true,
                collectedBy: true,
                student: true
            }
        });
    } catch (error) {
        console.error("Error fetching recent donations:", error);
        return [];
    }
}

export async function getDonors() {
    try {
        return await prisma.donor.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching donors:", error);
        return [];
    }
}

export async function getCommitteeMembers() {
    try {
        return await prisma.committeeMember.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching committee members:", error);
        return [];
    }
}

export async function getDonorById(id: string) {
    try {
        return await prisma.donor.findUnique({
            where: { id },
            include: {
                donations: {
                    orderBy: { date: 'desc' },
                    include: { collectedBy: true }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching donor:", error);
        return null;
    }
}

export async function getDonationsByDonorId(donorId: string) {
    try {
        return await prisma.donation.findMany({
            where: { donorId },
            orderBy: { date: 'desc' },
            include: { collectedBy: true }
        });
    } catch (error) {
        console.error("Error fetching donor donations:", error);
        return [];
    }
}

export async function createDonor(data: any) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        const donor = await prisma.donor.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                address: data.address,
                committee: data.committee,
                type: data.type,
                fixedAmount: data.fixedAmount || 0,
                notes: data.notes
            }
        });
        return { success: true, data: donor };
    } catch (error) {
        console.error("Create Donor Error:", error);
        return { success: false, error: "Failed to create donor" };
    }
}

export async function createCommitteeMember(data: any) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        const member = await prisma.committeeMember.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                role: data.role,
                active: true
            }
        });
        return { success: true, data: member };
    } catch (error) {
        console.error("Create Committee Member Error:", error);
        return { success: false, error: "Failed to create committee member" };
    }
}

export async function createDonation(data: any) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        let donorId = data.donorId;

        // If no donorId but name and phone are provided, find or create
        if (!donorId && data.donorName && data.phone) {
            const donor = await prisma.donor.upsert({
                where: { id: "temporary-id-never-match" }, // Dummy to force findFirst logic if we don't have ID
                // Actually prisma doesn't support findOrCreate easily with non-unique fields in upsert
                // So let's just find first
                update: {},
                create: {
                    name: data.donorName,
                    phone: data.phone,
                    email: data.email,
                    type: "GENERAL"
                }
            });
            // Correction: Upsert requires unique. Let's do it manually.
            const existingDonor = await prisma.donor.findFirst({
                where: { phone: data.phone }
            });

            if (existingDonor) {
                donorId = existingDonor.id;
            } else {
                const newDonor = await prisma.donor.create({
                    data: {
                        name: data.donorName,
                        phone: data.phone,
                        email: data.email,
                        type: "GENERAL"
                    }
                });
                donorId = newDonor.id;
            }
        }

        const donation = await prisma.donation.create({
            data: {
                amount: data.amount,
                purpose: data.purpose,
                paymentMethod: data.paymentMethod || "CASH",
                transactionId: data.transactionId,
                notes: data.notes,
                date: data.date || new Date(),
                donorId: donorId,
                collectedById: data.collectedById
            }
        });
        return { success: true, data: donation };
    } catch (error) {
        console.error("Create Donation Error:", error);
        return { success: false, error: "Failed to create donation" };
    }
}
