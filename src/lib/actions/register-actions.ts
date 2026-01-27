"use server";

import { prisma } from "@/lib/db";
// import { inviteUser } from "./student-portal-actions"; // Not needed as we create user directly
import { StudentMode, Residency, Gender, FundType } from "@prisma/client";
import { initiateSSLPayment } from "@/lib/payment/sslcommerz";
import { revalidatePath } from "next/cache";

// We need to hash password, but inviteUser might handle it or we set it directly.
// Checking `student-actions.ts`, it uses `inviteUser` from `./auth-actions`.
// But for self-registration, the user provides the password.
import bcrypt from "bcryptjs";

export async function registerStudentAndPay(data: {
    fullName: string;
    email: string;
    password?: string; // User sets password
    phoneNumber?: string;
    whatsappNumber?: string;
    gender: Gender;
    mode: StudentMode;
    residency: Residency;
    country?: string;
    departmentId?: string;
    batchId: string;
    studentID: string; // Auto-generated from frontend
}) {
    try {
        // 1. Validate Email
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return { success: false, error: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা আছে।" };
        }

        // Fetch course structure to get course fees
        const batchWithCourse = await prisma.batch.findUnique({
            where: { id: data.batchId },
            include: {
                department: {
                    include: {
                        course: true
                    }
                }
            }
        });

        if (!batchWithCourse) {
            return { success: false, error: "ব্যাচ খুঁজে পাওয়া যায়নি।" };
        }

        const batch = batchWithCourse;
        const dept = batch.department;
        const course = dept.course;

        // 3. Calculate Admission Fee
        let admissionFee = 0;

        if (data.residency === "PROBASHI") {
            // Priority: Batch > Dept > Course -> Then Fallback to General Fee
            admissionFee = batch.admissionFeeProbashi ?? dept.admissionFeeProbashi ?? course.admissionFeeProbashi ??
                batch.admissionFee ?? dept.admissionFee ?? course.admissionFee ?? 0;
        } else {
            // Local
            if (data.mode === "OFFLINE") {
                admissionFee = batch.admissionFeeOffline ?? dept.admissionFeeOffline ?? course.admissionFeeOffline ??
                    batch.admissionFee ?? dept.admissionFee ?? course.admissionFee ?? 0;
            } else {
                admissionFee = batch.admissionFee ?? dept.admissionFee ?? course.admissionFee ?? 0;
            }
        }

        // If fee is 0 or null, we might want to handle it (maybe free admission?)
        // For now assume payment is required if > 0

        // 4. Create User (DISABLED)
        const hashedPassword = await bcrypt.hash(data.password || "123456", 12);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: "STUDENT",
                status: "DISABLED", // Active only after payment
            }
        });

        // 5. Create Student Profile
        const student = await prisma.studentProfile.create({
            data: {
                userId: user.id,
                studentID: data.studentID,
                fullName: data.fullName,
                gender: data.gender,
                mode: data.mode,
                residency: data.residency,
                country: data.country,
                phoneNumber: data.phoneNumber,
                whatsappNumber: data.whatsappNumber,
                activeStatus: false, // Inactive
                departmentId: batch.departmentId,
                feeTier: "GENERAL",
            }
        });

        // 6. Create Enrollment
        await prisma.enrollment.create({
            data: {
                studentId: student.id,
                batchId: data.batchId,
                isAdmissionFeePaid: false
            }
        });

        // 3a. Calculate Monthly Fee
        let monthlyFee = 0;
        if (data.residency === "PROBASHI") {
            monthlyFee = batch.monthlyFeeProbashi ?? dept.monthlyFeeProbashi ?? course.monthlyFeeProbashi ??
                batch.monthlyFee ?? dept.monthlyFee ?? course.monthlyFee ?? 0;
        } else {
            if (data.mode === "OFFLINE") {
                monthlyFee = batch.monthlyFeeOffline ?? dept.monthlyFeeOffline ?? course.monthlyFeeOffline ??
                    batch.monthlyFee ?? dept.monthlyFee ?? course.monthlyFee ?? 0;
            } else {
                monthlyFee = batch.monthlyFee ?? dept.monthlyFee ?? course.monthlyFee ?? 0;
            }
        }

        // 7. Create Admission Invoice
        const admissionInvoice = await prisma.monthlyInvoice.create({
            data: {
                studentId: student.id,
                month: 0, // 0 for Admission
                year: new Date().getFullYear(),
                amount: admissionFee,
                status: "UNPAID",
                dueDate: new Date(),
            }
        });

        // 7b. Create First Month Invoice
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const monthlyInvoice = await prisma.monthlyInvoice.create({
            data: {
                studentId: student.id,
                month: currentMonth,
                year: new Date().getFullYear(),
                amount: monthlyFee,
                status: "UNPAID",
                dueDate: new Date(),
            }
        });

        const totalAmount = admissionFee + monthlyFee;

        // 8. Initiate Payment
        const paymentRes = await initiateSSLPayment({
            total_amount: totalAmount,
            currency: data.residency === "PROBASHI" ? "USD" : "BDT",
            tran_id: `REG-${admissionInvoice.id}-${Date.now()}`,
            product_category: "Admission",
            product_name: `Admission & Monthly Fee - ${batch.department.name}`,
            cus_name: data.fullName,
            cus_email: data.email,
            cus_add1: data.country || "Bangladesh",
            cus_city: "Dhaka",
            cus_postcode: "1000",
            cus_country: data.country || "Bangladesh",
            cus_phone: data.phoneNumber || "01700000000",
            value_a: `${admissionInvoice.id},${monthlyInvoice.id}`, // Pass both IDs
            value_b: "REGISTRATION",
        });

        if (paymentRes.success) {
            return { success: true, url: paymentRes.url };
        } else {
            return { success: false, error: "Payment initiation failed: " + paymentRes.error };
        }

    } catch (error: any) {
        console.error("Registration Error:", error);
        return { success: false, error: error.message || "Registration failed" };
    }
}
