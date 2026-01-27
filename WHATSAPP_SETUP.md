# WhatsApp Integration Setup Guide

This guide explains how to set up WhatsApp messaging in your Internet Madrasha system using **Meta's WhatsApp Cloud API** (FREE).

## Why Meta Cloud API?

- ✅ **100% FREE** - No third-party service fees
- ✅ **1000 free conversations per month**
- ✅ **Official WhatsApp API**
- ✅ **No monthly subscription**

## Setup Steps

### 1. Create a Meta Business Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as app type
4. Fill in your app details

### 2. Enable WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Follow the setup wizard

### 3. Get Your Credentials

You need two pieces of information:

#### A. Phone Number ID
1. Go to WhatsApp → Getting Started
2. Copy the "Phone Number ID" (looks like: `123456789012345`)

#### B. Access Token
1. Go to WhatsApp → Getting Started
2. Click "Generate Token" or use an existing token
3. Copy the temporary access token
4. **For production**: Create a permanent token in System Users

### 4. Configure in Admin Panel

1. Login to your admin dashboard
2. Go to **Settings** → **WhatsApp Configuration**
3. Fill in the following:
   - **Enable WhatsApp**: Toggle ON
   - **Provider**: Select "META_CLOUD_API"
   - **Access Token**: Paste your access token (from step 3B)
   - **Phone Number ID**: Paste your phone number ID (from step 3A)

### 5. Test the Configuration

1. In the WhatsApp settings page, click **"Test WhatsApp"**
2. Enter a test phone number (must be in international format: +8801XXXXXXXXX)
3. Click "Send Test Message"
4. Check if you receive the message on WhatsApp

## Phone Number Format

All phone numbers must be in international format:

- ✅ Correct: `+8801712345678`
- ❌ Wrong: `01712345678`
- ❌ Wrong: `8801712345678`

The system will automatically convert Bangladesh numbers starting with `01` to `+8801`.

## Features

WhatsApp messages are automatically sent for:

### For Teachers:
- ✉️ Login credentials when account is created
- 🔑 Password reset links
- 📧 Credential resend

### For Students:
- ✉️ Login credentials when registered
- 💳 Payment confirmations with receipt
- 🔑 Password reset links
- 📧 Credential resend

## Message Templates

### Credential Message
```
🎓 Internet Madrasha

Assalamu Alaikum, [Name]!

Your Teacher account has been created successfully.

📧 Email: [email]
🔑 Password: [password]

⚠️ Please change your password immediately after login.

🔗 Login: [portal URL]

JazakAllah Khair!
```

### Payment Confirmation
```
💳 Internet Madrasha
Payment Receipt

Dear [Student Name],

We have received your payment. JazakAllah Khair!

📋 Transaction ID: [ID]
📅 Date: [Date]

Payment Details:
  • Monthly Fee - January 2026: BDT 500

💰 Total Amount: BDT 500

If you have any questions, please contact the administration office.
```

## Troubleshooting

### Messages not sending?

1. **Check WhatsApp is enabled** in admin settings
2. **Verify credentials** are correct (Access Token & Phone Number ID)
3. **Check phone number format** - must start with `+880`
4. **Verify Meta app status** - app must be in "Live" mode for production
5. **Check conversation limits** - free tier has 1000 conversations/month

### Getting "Invalid Phone Number" error?

- Phone numbers must be in international format: `+8801XXXXXXXXX`
- Remove any spaces, dashes, or special characters
- Bangladesh numbers: `+880` followed by 10 digits

### Access Token Expired?

- Temporary tokens expire after 24 hours
- Create a permanent token using System Users in Meta Business Settings
- Update the token in admin settings

## Production Deployment

For production use:

1. **Verify your Business** on Meta
2. **Create a System User** with permanent token
3. **Submit your app for review** (if using message templates)
4. **Switch to Live Mode** in Meta app settings
5. **Update token** in admin panel with permanent token

## Cost

- **Free Tier**: 1000 conversations per month
- **After free tier**: ~$0.005 - $0.01 per conversation (very cheap!)
- **No monthly fees**
- **No setup fees**

## Support

For Meta WhatsApp API support:
- [Official Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Getting Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)

## Security Notes

- ⚠️ **Never share your Access Token** publicly
- ⚠️ Store tokens securely in database (encrypted)
- ⚠️ Use permanent tokens for production
- ⚠️ Regularly rotate tokens for security
