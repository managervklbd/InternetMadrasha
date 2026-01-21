
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching Live Class Session Configs (JS)...");

    const configs = await prisma.liveClassSessionConfig.findMany();

    console.log(`Found ${configs.length} configs.`);
    for (const config of configs) {
        console.log(`- Key: ${config.key}, Label: ${config.label}`);
        console.log(`  StartTime: "${config.startTime}"`);
        console.log(`  EndTime:   "${config.endTime}"`);
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
