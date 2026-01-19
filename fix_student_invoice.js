const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    const email = 'maxtechctg@gmail.com';
    const studentUser = await prisma.user.findUnique({
        where: { email },
        include: { studentProfile: true }
    });

    if (!studentUser) {
        console.log('Student not found');
        return;
    }

    const studentId = studentUser.studentProfile.id;
    console.log('Target Student ID:', studentId);

    // 1. Check current state
    const invoicesBefore = await prisma.monthlyInvoice.findMany({ where: { studentId } });
    console.log('Invoices Before:', invoicesBefore.length);

    // 2. Fetch student with billing data
    const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
            enrollments: {
                include: {
                    batch: {
                        include: {
                            department: {
                                include: { course: true }
                            }
                        }
                    }
                },
                orderBy: { joinedAt: 'desc' },
                take: 1
            },
            planHistory: {
                include: { plan: true },
                orderBy: { startDate: 'desc' },
                take: 1
            }
        }
    });

    console.log('Enrollment found:', !!student.enrollments[0]);
    if (student.enrollments[0]) {
        const b = student.enrollments[0].batch;
        console.log('Batch:', b.name, 'Fees:', { m: b.monthlyFee, s: b.sadkaFee });
        console.log('Dept Fees:', { m: b.department.monthlyFee, s: b.department.sadkaFee });
        console.log('Course Fees:', { m: b.department.course.monthlyFee, s: b.department.course.sadkaFee });
    }

    // 3. Perform manual sync logic
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    console.log('Current Month/Year:', month, '/', year);

    let amount = 0;
    const enrollment = student.enrollments[0];
    if (enrollment && enrollment.batch) {
        const b = enrollment.batch;
        const d = b.department;
        const c = d.course;

        // Use the proper hierarchy
        amount = b.monthlyFee ?? d.monthlyFee ?? c.monthlyFee ?? 0;
        console.log('Calculated Amount:', amount);
    }

    if (amount > 0) {
        console.log('Creating invoice...');
        try {
            const inv = await prisma.monthlyInvoice.upsert({
                where: {
                    studentId_month_year: {
                        studentId,
                        month,
                        year
                    }
                },
                update: { amount },
                create: {
                    studentId,
                    month,
                    year,
                    amount,
                    dueDate: new Date(year, month - 1, 10), // Fixed 0-indexed month
                    status: 'UNPAID'
                }
            });
            console.log('Invoice Created/Updated:', inv.id, 'Amount:', inv.amount);
        } catch (e) {
            console.error('Failed to create invoice:', e);
        }
    } else {
        console.log('Amount is 0, skipping creation.');
    }
}

fix()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
