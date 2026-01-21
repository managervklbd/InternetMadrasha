
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.siteSettings.findFirst({
        where: { id: 1 },
    });
    fs.writeFileSync('settings-dump.json', JSON.stringify(settings, null, 2));
    console.log('Settings dumped to settings-dump.json');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
