
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking LiveClassSessionConfig count...");
        const count = await prisma.liveClassSessionConfig.count();
        console.log(`Count: ${count}`);

        if (count > 0) {
            const items = await prisma.liveClassSessionConfig.findMany();
            console.log("Items:", JSON.stringify(items, null, 2));
        } else {
            console.log("No session configs found in the database.");
        }
    } catch (e) {
        console.error("Error querying database:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
