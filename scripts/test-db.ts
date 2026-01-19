import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing database connection...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password

    try {
        await prisma.$connect();
        console.log('✅ Successfully connected to database!');
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 5;`;
        console.log('Query result:', tables);
    } catch (e) {
        console.error('❌ Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
