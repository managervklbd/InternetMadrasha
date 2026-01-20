"use server";

import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { logAdminAction } from "../audit";
import { sendCredentialEmail, sendPasswordResetEmail } from "@/lib/mail";

/**
 * Creates a new user in INVITED status and returns the invitation link.
 * In a real app, this would also trigger an email.
 */


/**
 * Creates a new user in ACTIVE status with auto-generated credentials and triggers email.
 */
export async function inviteUser(email: string, role: Role, fullName: string) {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("এই ইমেল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট বিদ্যমান।");
    }

    // Generate random 8-character password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            role,
            status: "ACTIVE", // Auto-activate
            password: hashedPassword,
        },
    });

    if (role === "TEACHER") {
        await prisma.teacherProfile.create({
            data: {
                userId: user.id,
                fullName,
                gender: "MALE", // Default
            }
        });
    }

    // Send Credential Email
    await sendCredentialEmail(email, fullName, password, role);

    await logAdminAction(
        "USER_CREATE_AUTO",
        "User",
        user.id,
        { email, role, fullName }
    );

    return { user, inviteLink: null };
}

/**
 * Activates an invited account by setting the password.
 */
export async function activateAccount(token: string, password: string) {
    const user = await prisma.user.findFirst({
        where: { invitationToken: token, status: "INVITED" },
    });

    if (!user) {
        throw new Error("Invalid or expired invitation token.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            status: "ACTIVE",
            invitationToken: null, // Invalidate token
        },
    });

    return { success: true };
}
export async function login(formData: FormData) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirect: false,
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

/**
 * Initiates the password reset process.
 */


export async function requestPasswordReset(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security, do not reveal if user exists.
            console.log("Password reset requested for non-existent email:", email);
            return { success: true, message: "If an account exists, a reset link has been sent." };
        }

        const token = uuidv4();
        const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        });

        const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
        await sendPasswordResetEmail(email, resetLink);

        return { success: true, message: "Reset link sent to your email." };
    } catch (error: any) {
        console.error("Error in requestPasswordReset:", error);
        return { success: false, error: error.message || "Failed to process request" };
    }
}

/**
 * Resets the password using the token.
 */
export async function resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gt: new Date() },
        },
    });

    if (!user) {
        return { success: false, error: "Invalid or expired token." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });

    return { success: true, message: "Password reset successfully." };
}

/**
 * Resends credentials to an existing user by generating a new password.
 */
export async function resendUserCredentials(email: string, fullName: string, role: Role = "STUDENT") {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("User not found.");
    }

    // Generate random 8-character password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            status: "ACTIVE", // Ensure active
        },
    });

    // Send Credential Email
    await sendCredentialEmail(email, fullName, password, role);

    await logAdminAction(
        "USER_RESEND_CREDENTIALS",
        "User",
        user.id,
        { email, fullName, role }
    );

    return { success: true };
}
