const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { syncStudentMonthlyInvoice } = require('./src/lib/actions/billing-actions');

async function debug() {
    const email = 'maxtechctg@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { studentProfile: true }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('Testing syncStudentMonthlyInvoice for:', user.studentProfile.id);
    try {
        const result = await syncStudentMonthlyInvoice(user.studentProfile.id);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error in sync:', e);
    }
}

debug()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
