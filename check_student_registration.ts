
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    let output = "";
    output += "Checking for user 'admin@internetmadrasha.com'...\n";
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@internetmadrasha.com' },
        include: { studentProfile: true, teacherProfile: true }
    });
    output += `User found: ${JSON.stringify(adminUser, null, 2)}\n`;

    output += "\nChecking for user 'mlsbd173@gmail.com'...\n";
    const otherUser = await prisma.user.findUnique({
        where: { email: 'mlsbd173@gmail.com' },
        include: { studentProfile: true }
    });
    output += `User found: ${JSON.stringify(otherUser, null, 2)}\n`;

    output += "\nListing last 5 created users:\n";
    const lastUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { studentProfile: true }
    });
    lastUsers.forEach(u => {
        output += `- ${u.email} (${u.role}) - Created: ${u.createdAt} - StudentProfile: ${u.studentProfile ? 'Yes' : 'No'}\n`;
    });

    fs.writeFileSync('registration_check_output.txt', output);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
