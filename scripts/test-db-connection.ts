
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to connect to database...');
    try {
        const result = await prisma.$queryRaw`SELECT 1`;
        console.log('Successfully connected to database!');
        console.log('Result:', result);
    } catch (error) {
        console.error('Failed to connect to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
