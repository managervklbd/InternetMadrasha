import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

export async function sendCredentialEmail(email: string, name: string, password: string) {
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

        // Auto-fix: Port 587 is typically STARTTLS (secure: false), Port 465 is SSL (secure: true)
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
            connectionTimeout: 60000, // 60s timeout
            greetingTimeout: 30000,
            socketTimeout: 60000,
        });


        const mailOptions = {
            from: `"${settings.madrasaName}" <${settings.smtpUser}>`,
            to: email,
            subject: `Welcome to ${settings.madrasaName} - Your Login Credentials`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0d9488; text-align: center;">Welcome to ${settings.madrasaName}</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>Your student account has been successfully created. You can now log in to the student portal using the credentials below:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Username / Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #fff; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
                    </div>

                    <p>Please login and change your password immediately for security.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.NEXTAUTH_URL}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">If you did not request this account, please contact the administration.</p>
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
