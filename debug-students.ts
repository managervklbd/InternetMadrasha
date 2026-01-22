
import { prisma } from './src/lib/db';

async function main() {
    try {
        const count = await prisma.studentProfile.count();
        const activeCount = await prisma.studentProfile.count({ where: { activeStatus: true } });
        console.log(`Total Students: ${count}`);
        console.log(`Active Students: ${activeCount}`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
