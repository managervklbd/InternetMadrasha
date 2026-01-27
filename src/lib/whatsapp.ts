import { prisma } from "@/lib/db";

/**
 * WhatsApp Integration using Meta Cloud API (Free)
 * 
 * Setup Instructions:
 * 1. Go to https://developers.facebook.com/
 * 2. Create a Meta App and enable WhatsApp Business API
 * 3. Get your Phone Number ID and Access Token
 * 4. Configure in Admin Settings
 * 
 * Free Tier: 1000 conversations per month
 */

interface WhatsAppSettings {
    enabled: boolean;
    provider: string | null;
    apiKey: string | null; // This will be the Access Token
    phoneNumberId: string | null; // This will be stored in apiSecret field
}

async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
    const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });

    return {
        enabled: settings?.whatsappEnabled || false,
        provider: settings?.whatsappProvider || "META_CLOUD_API",
        apiKey: settings?.whatsappApiKey || null, // Access Token
        phoneNumberId: settings?.whatsappApiSecret || null, // Phone Number ID
    };
}

/**
 * Send WhatsApp message using Meta Cloud API
 */
export async function sendWhatsAppMessage({
    to,
    message,
}: {
    to: string;
    message: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const settings = await getWhatsAppSettings();

        if (!settings.enabled) {
            console.log("WhatsApp is disabled. Message not sent:", { to });
            return { success: false, error: "WhatsApp disabled" };
        }

        if (!settings.apiKey || !settings.phoneNumberId) {
            console.warn("WhatsApp not configured. Message not sent:", { to });
            return { success: false, error: "WhatsApp not configured" };
        }

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = to.replace(/[^0-9+]/g, "");

        // Ensure phone number has country code
        const phoneWithCountryCode = cleanPhone.startsWith("+")
            ? cleanPhone
            : `+880${cleanPhone.replace(/^0/, "")}`; // Bangladesh country code

        // Meta Cloud API endpoint
        const url = `https://graph.facebook.com/v18.0/${settings.phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${settings.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: phoneWithCountryCode,
                type: "text",
                text: {
                    body: message,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API error:", data);
            return {
                success: false,
                error: data.error?.message || "Failed to send WhatsApp message"
            };
        }

        console.log("WhatsApp message sent successfully:", data);
        return { success: true };

    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Send login credentials via WhatsApp
 */
export async function sendCredentialWhatsApp(
    phone: string,
    name: string,
    email: string,
    password: string,
    role: "TEACHER" | "STUDENT" | "ADMIN" = "STUDENT"
) {
    try {
        const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
        const madrasaName = settings?.madrasaName || "Internet Madrasha";
        const portalUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

        const roleText = role === "TEACHER" ? "Teacher" : (role === "ADMIN" ? "Admin" : "Student");

        const message = `🎓 *${madrasaName}*
        
Assalamu Alaikum, ${name}!

Your ${roleText} account has been created successfully.

📧 *Email:* ${email}
🔑 *Password:* ${password}

⚠️ Please change your password immediately after login.

🔗 Login: ${portalUrl}

JazakAllah Khair!`;

        return await sendWhatsAppMessage({ to: phone, message });

    } catch (error) {
        console.error("Error sending credential WhatsApp:", error);
        return { success: false, error: "Failed to send credentials" };
    }
}

/**
 * Send payment confirmation via WhatsApp
 */
export async function sendPaymentConfirmationWhatsApp(
    phone: string,
    studentName: string,
    amount: number,
    transactionId: string,
    items: { description: string; amount: number }[]
) {
    try {
        const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
        const madrasaName = settings?.madrasaName || "Internet Madrasha";
        const date = new Date().toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const itemsList = items
            .map(item => `  • ${item.description}: BDT ${item.amount}`)
            .join('\n');

        const message = `💳 *${madrasaName}*
*Payment Receipt*

Dear ${studentName},

We have received your payment. JazakAllah Khair!

📋 *Transaction ID:* ${transactionId}
📅 *Date:* ${date}

*Payment Details:*
${itemsList}

💰 *Total Amount:* BDT ${amount}

If you have any questions, please contact the administration office.

${madrasaName}`;

        return await sendWhatsAppMessage({ to: phone, message });

    } catch (error) {
        console.error("Error sending payment WhatsApp:", error);
        return { success: false, error: "Failed to send payment confirmation" };
    }
}

/**
 * Send live class notification via WhatsApp
 */
export async function sendLiveClassNotificationWhatsApp(
    phone: string,
    studentName: string,
    classTitle: string,
    liveLink: string,
    sessionTime: string,
    date: string
) {
    try {
        const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
        const madrasaName = settings?.madrasaName || "Internet Madrasha";

        const message = `📚 *${madrasaName}*
*Live Class Notification*

Assalamu Alaikum ${studentName}!

A new live class has been scheduled:

📖 *Class:* ${classTitle}
⏰ *Time:* ${sessionTime}
📅 *Date:* ${date}

🔗 *Join Link:* ${liveLink}

Please join on time. May Allah bless your studies!

${madrasaName}`;

        return await sendWhatsAppMessage({ to: phone, message });

    } catch (error) {
        console.error("Error sending live class WhatsApp:", error);
        return { success: false, error: "Failed to send live class notification" };
    }
}

/**
 * Send password reset link via WhatsApp
 */
export async function sendPasswordResetWhatsApp(
    phone: string,
    name: string,
    resetLink: string
) {
    try {
        const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
        const madrasaName = settings?.madrasaName || "Internet Madrasha";

        const message = `🔐 *${madrasaName}*
*Password Reset Request*

Assalamu Alaikum ${name}!

We received a request to reset your password.

🔗 *Reset Link:* ${resetLink}

⏱️ This link will expire in 1 hour.

If you did not request this, please ignore this message.

${madrasaName}`;

        return await sendWhatsAppMessage({ to: phone, message });

    } catch (error) {
        console.error("Error sending password reset WhatsApp:", error);
        return { success: false, error: "Failed to send password reset" };
    }
}

/**
 * Test WhatsApp configuration
 */
export async function testWhatsAppConfiguration(testPhone: string): Promise<{ success: boolean; error?: string }> {
    const message = `🎉 *WhatsApp Configuration Test*

This is a test message from your Internet Madrasha system.

If you received this, your WhatsApp integration is working correctly!

✅ Configuration successful!`;

    return await sendWhatsAppMessage({ to: testPhone, message });
}
