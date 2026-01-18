"use server";

import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { logAdminAction } from "../audit";

/**
 * Creates a new user in INVITED status and returns the invitation link.
 * In a real app, this would also trigger an email.
 */
export async function inviteUser(email: string, role: Role, fullName: string) {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("এই ইমেল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট বিদ্যমান।");
    }

    const invitationToken = uuidv4();

    const user = await prisma.user.create({
        data: {
            email,
            role,
            status: "INVITED",
            invitationToken,
        },
    });

    if (role === "TEACHER") {
        await prisma.teacherProfile.create({
            data: {
                userId: user.id,
                fullName,
                gender: "MALE", // Default, should be passed from form in real use
            }
        });
    }

    const inviteLink = `${process.env.NEXTAUTH_URL}/auth/invite?token=${invitationToken}`;

    // Here you would call your email service (e.g., Resend, AWS SES)
    console.log(`Invitation sent to ${email}: ${inviteLink}`);

    await logAdminAction(
        "USER_INVITE",
        "User",
        user.id,
        { email, role, fullName }
    );

    return { user, inviteLink };
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
