
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const defaults = [
        { key: "MORNING", label: "সকাল (Morning)", startTime: "08:00", endTime: "12:00" },
        { key: "NOON", label: "দুপুর (Noon)", startTime: "14:00", endTime: "16:00" },
        { key: "NIGHT", label: "রাত (Night)", startTime: "20:00", endTime: "22:00" },
    ];

    console.log("Seeding session configurations...");

    for (const d of defaults) {
        const exists = await prisma.liveClassSessionConfig.findUnique({ where: { key: d.key } });
        if (!exists) {
            await prisma.liveClassSessionConfig.create({
                data: d
            });
            console.log(`Created: ${d.label}`);
        } else {
            console.log(`Skipped (Exists): ${d.label}`);
        }
    }

    console.log("Done.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
