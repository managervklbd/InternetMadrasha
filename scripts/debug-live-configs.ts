
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching Live Class Session Configs...");

    const configs = await prisma.liveClassSessionConfig.findMany();

    console.log(`Found ${configs.length} configs.`);
    for (const config of configs) {
        console.log(`- Key: ${config.key}, Label: ${config.label}`);
        console.log(`  StartTime: "${config.startTime}" (Type: ${typeof config.startTime})`);
        console.log(`  EndTime:   "${config.endTime}"   (Type: ${typeof config.endTime})`);
    }

    const monthlyClasses = await prisma.monthlyLiveClass.findMany({
        where: { active: true },
        take: 3
    });

    console.log(`\nActive Monthly Live Classes (Sample):`);
    for (const cls of monthlyClasses) {
        console.log(`- ${cls.title} (${cls.month}/${cls.year})`);
        console.log(`  SessionKeys: ${JSON.stringify(cls.sessionKeys)}`);
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
