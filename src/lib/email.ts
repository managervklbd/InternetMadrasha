
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

export async function sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
    try {
        const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });

        if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPass) {
            console.warn("SMTP settings not configured. Email not sent:", { to, subject });
            return false;
        }

        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpSecure || false,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass,
            },
        });

        const info = await transporter.sendMail({
            from: `"${settings.madrasaName}" <${settings.smtpUser}>`,
            to: Array.isArray(to) ? to.join(",") : to,
            subject: subject,
            html: html,
        });

        console.log("Email sent:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
