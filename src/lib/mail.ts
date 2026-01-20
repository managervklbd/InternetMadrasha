import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

export async function sendCredentialEmail(email: string, name: string, password: string, role: "TEACHER" | "STUDENT" | "ADMIN" = "STUDENT") {
    try {
        const settings = await prisma.siteSettings.findFirst({
            where: { id: 1 },
        });

        if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
            console.error("SMTP settings not configured");
            return { success: false, error: "SMTP Not Configured" };
        }

        const isSecure = settings.smtpSecure || false;
        const port = settings.smtpPort || 587;
        const shouldUseSecure = port === 465 ? true : (port === 587 ? false : isSecure);

        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: port,
            secure: shouldUseSecure,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass,
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
        });

        const roleText = role === "TEACHER" ? "Teacher" : (role === "ADMIN" ? "Admin" : "Student");
        const logoUrl = settings.madrasaLogo || "https://placehold.co/100x100?text=Logo"; // Fallback if no logo
        const portalUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

        const mailOptions = {
            from: `"${settings.madrasaName}" <${settings.smtpUser}>`,
            to: email,
            subject: `Welcome to ${settings.madrasaName} - Your Login Credentials`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                    <!-- Header -->
                    <div style="background-color: #0d9488; padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${settings.madrasaName}</h1>
                        <p style="color: #ccfbf1; margin: 5px 0 0;">${roleText} Portal Access</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <p style="font-size: 16px; color: #374151; margin-top: 0;">Dear <strong>${name}</strong>,</p>
                        <p style="font-size: 16px; color: #374151; line-height: 1.5;">
                            Assalamu Alaikum, <br><br>
                            Your <strong>${roleText}</strong> account has been successfully created. We are excited to have you with us.
                        </p>
                        
                        <div style="background-color: #f0fdf9; border: 1px solid #ccfbf1; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <p style="margin: 0 0 10px; color: #115e59; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Login Credentials</p>
                            <p style="margin: 5px 0; font-size: 15px;"><strong>Email / Username:</strong> <span style="color: #0f172a;">${email}</span></p>
                            <p style="margin: 5px 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="font-family: 'Courier New', monospace; font-size: 16px; background: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; color: #dc2626; font-weight: bold;">${password}</span></p>
                        </div>

                        <p style="font-size: 15px; color: #4b5563; margin-bottom: 30px;">
                            Please log in and <span style="color: #dc2626; font-weight: bold;">change your password immediately</span> to secure your account.
                        </p>

                        <div style="text-align: center;">
                            <a href="${portalUrl}" style="background-color: #0d9488; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s;">Login to Portal</a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0;">
                            &copy; ${new Date().getFullYear()} ${settings.madrasaName}. All rights reserved.
                        </p>
                        <p style="font-size: 12px; color: #9ca3af; margin-top: 5px;">
                            ${settings.madrasaAddress || "Internet Madrasha"}
                        </p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return { success: true };

    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: "Failed to send email" };
    }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    try {
        const settings = await prisma.siteSettings.findFirst({
            where: { id: 1 },
        });

        if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
            console.error("SMTP settings not configured");
            return { success: false, error: "SMTP Not Configured" };
        }

        const isSecure = settings.smtpSecure || false;
        const port = settings.smtpPort || 587;
        const shouldUseSecure = port === 465 ? true : (port === 587 ? false : isSecure);

        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: port,
            secure: shouldUseSecure,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass,
            },
            tls: {
                rejectUnauthorized: false
            },
        });

        const mailOptions = {
            from: `"${settings.madrasaName}" <${settings.smtpUser}>`,
            to: email,
            subject: `Password Reset Request - ${settings.madrasaName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0d9488; text-align: center;">Password Reset Request</h2>
                    <p>We received a request to reset your password for your <strong>${settings.madrasaName}</strong> account.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    
                    <p style="text-align: center; font-size: 14px; color: #555;">Or click this link: <a href="${resetLink}">${resetLink}</a></p>

                    <p>This link will expire in 1 hour.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Reset email sent: %s", info.messageId);
        return { success: true };

    } catch (error) {
        console.error("Error sending reset email:", error);
        return { success: false, error: "Failed to send email" };
    }
}
