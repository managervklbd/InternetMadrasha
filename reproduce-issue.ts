
import { updateSiteSettings, getSiteSettings } from './src/lib/actions/settings-actions';
import { prisma } from './src/lib/db';

async function main() {
    console.log('--- Starting Reproduction Test ---');

    // 1. Initial State
    const initial = await getSiteSettings();
    console.log('Initial SMTP Host:', initial?.smtpHost);

    // 2. Update
    const testHost = "smtp.test.com";
    console.log(`Updating SMTP Host to: ${testHost}`);

    try {
        await updateSiteSettings({
            madrasaName: initial?.madrasaName || "Test Madrasa",
            siteActive: initial?.siteActive ?? true,
            smtpHost: testHost,
            smtpPort: 587,
            smtpUser: "user",
            smtpPass: "pass",
            smtpSecure: true
        });
        console.log('Update function called successfully.');
    } catch (e) {
        console.error('Error calling updateSiteSettings:', e);
    }

    // 3. Verify
    const updated = await getSiteSettings();
    console.log('Updated SMTP Host:', updated?.smtpHost);

    if (updated?.smtpHost === testHost) {
        console.log('SUCCESS: Settings were saved.');
    } else {
        console.log('FAILURE: Settings were NOT saved.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
