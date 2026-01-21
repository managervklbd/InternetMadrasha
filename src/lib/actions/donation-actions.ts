"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DonationPurpose, PaymentMethod, FundType } from "@prisma/client";

export async function createDonation(data: {
    donorName: string;
    phone?: string;
    email?: string;
    amount: number;
    purpose: DonationPurpose;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    notes?: string;
    date: Date;
    collectedById?: string;
}) {
    try {
        // 1. Find or Create Donor
        // Simple logic: if phone provided, try to find. Else create.
        let donorId: string | null = null;

        if (data.phone) {
            const existing = await prisma.donor.findFirst({ where: { phone: data.phone } });
            if (existing) {
                donorId = existing.id;
            }
        }

        if (!donorId) {
            const newDonor = await prisma.donor.create({
                data: {
                    name: data.donorName,
                    phone: data.phone,
                    email: data.email
                }
            });
            donorId = newDonor.id;
        }

        // 2. Generate Receipt Number
        const dateStr = data.date.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const receiptNo = `RCP-${dateStr}-${randomStr}`;

        // 3. Create Donation
        const donation = await prisma.donation.create({
            data: {
                amount: data.amount,
                purpose: data.purpose,
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId,
                receiptNo: receiptNo,
                notes: data.notes,
                date: data.date,
                donorId: donorId,
                collectedById: data.collectedById
            },
            include: { donor: true }
        });

        // 4. Create Ledger Transaction for Financial Reports
        // Determine Fund Type: If collected by committee member or donor is in a committee
        let fundType: FundType = FundType.DONATION;
        if (data.collectedById || donation.donor?.committee) {
            fundType = FundType.DANA_COMMITTEE;
        }

        await prisma.ledgerTransaction.create({
            data: {
                fundType: fundType,
                amount: data.amount,
                dr_cr: "CR",
                description: `Donation: ${data.donorName} (${data.purpose})`,
                referenceId: donation.id,
                transactionDate: data.date,
            }
        });

        revalidatePath("/admin/donations");
        revalidatePath("/admin/reports"); // Update financial reports
        return { success: true, donation };

    } catch (error) {
        console.error("Error creating donation:", error);
        return { success: false, error: "Failed to create donation" };
    }
}

export async function getDonationStats() {
    try {
        const total = await prisma.donation.aggregate({
            _sum: { amount: true }
        });

        // Monthly (Current Month)
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthly = await prisma.donation.aggregate({
            where: {
                date: { gte: firstDay }
            },
            _sum: { amount: true }
        });

        // Active Donors
        const donors = await prisma.donor.count();

        return {
            total: total._sum.amount || 0,
            monthly: monthly._sum.amount || 0,
            donors: donors,
            monthlyExpected: 0 // Placeholder
        };
    } catch (error) {
        console.error("Error getting stats:", error);
        return { total: 0, monthly: 0, donors: 0, monthlyExpected: 0 };
    }
}

export async function getRecentDonations() {
    try {
        return await prisma.donation.findMany({
            include: {
                donor: true,
                collectedBy: true
            },
            orderBy: { date: 'desc' },
            take: 50 // Increased from 20
        });
    } catch (error) {
        console.error("Error getting donations:", error);
        return [];
    }
}


export async function createDonor(data: {
    name: string;
    phone: string;
    address?: string;
    committee?: string;
    type: string;
    fixedAmount?: number;
    notes?: string;
}) {
    try {
        const donor = await prisma.donor.create({
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
                committee: data.committee,
                type: data.type,
                fixedAmount: data.fixedAmount,
                notes: data.notes
            }
        });
        revalidatePath("/admin/donations");
        return { success: true, donor };
    } catch (error) {
        console.error("Error creating donor:", error);
        return { success: false, error: "Failed to create donor" };
    }
}

export async function getDonors() {
    try {
        return await prisma.donor.findMany({
            include: {
                _count: {
                    select: { donations: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error getting donors:", error);
        return [];
    }
}

export async function createCommitteeMember(data: {
    name: string;
    phone: string;
    role: string;
    email?: string;
}) {
    try {
        const member = await prisma.committeeMember.create({
            data: {
                name: data.name,
                phone: data.phone,
                role: data.role,
                email: data.email
            }
        });
        revalidatePath("/admin/donations");
        return { success: true, member };
    } catch (error) {
        console.error("Error creating committee member:", error);
        return { success: false, error: "Failed to create committee member" };
    }
}

export async function getCommitteeMembers() {
    try {
        return await prisma.committeeMember.findMany({
            include: {
                _count: {
                    select: { collectedDonations: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error getting committee members:", error);
        return [];
    }
}

export async function getDonorById(id: string) {
    try {
        return await prisma.donor.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { donations: true }
                }
            }
        });
    } catch (error) {
        console.error("Error getting donor:", error);
        return null;
    }
}

export async function getDonationsByDonorId(donorId: string) {
    try {
        return await prisma.donation.findMany({
            where: { donorId },
            include: {
                donor: true,
                collectedBy: true
            },
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        console.error("Error getting donor history:", error);
        return [];
    }
}

export async function getSiteSettings() {
    try {
        return await prisma.siteSettings.findFirst();
    } catch (error) {
        console.error("Error getting site settings:", error);
        return null;
    }
}

export async function syncExistingDonationsToLedger() {
    try {
        const donations = await prisma.donation.findMany({
            include: { donor: true }
        });

        let count = 0;
        for (const donation of donations) {
            // Check if ledger entry already exists to avoid duplicates
            const existing = await prisma.ledgerTransaction.findFirst({
                where: { referenceId: donation.id }
            });

            if (!existing) {
                let fundType: FundType = FundType.DONATION;
                if (donation.collectedById || donation.donor?.committee) {
                    fundType = FundType.DANA_COMMITTEE;
                }

                await prisma.ledgerTransaction.create({
                    data: {
                        fundType: fundType,
                        amount: donation.amount,
                        dr_cr: "CR",
                        description: `Sync: Donation from ${donation.donor?.name || 'Unknown'}`,
                        referenceId: donation.id,
                        transactionDate: donation.date,
                    }
                });
                count++;
            }
        }
        revalidatePath("/admin/reports");
        return { success: true, count };
    } catch (error) {
        console.error("Sync error:", error);
        return { success: false, error: "Sync failed" };
    }
}

