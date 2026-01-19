const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    const email = 'maxtechctg@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            studentProfile: {
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
                        }
                    },
                    planHistory: {
                        include: { plan: true }
                    },
                    invoices: true
                }
            }
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    const student = user.studentProfile;
    console.log('Student:', student.fullName, '(', student.id, ')');
    console.log('Fee Tier:', student.feeTier);

    console.log('--- Enrollment ---');
    const enrollment = student.enrollments[0];
    if (enrollment) {
        const batch = enrollment.batch;
        const dept = batch.department;
        const course = dept.course;

        console.log('Batch:', batch.name, '(', batch.id, ') Fees:', { monthly: batch.monthlyFee, sadka: batch.sadkaFee });
        console.log('Dept:', dept.name, '(', dept.id, ') Fees:', { monthly: dept.monthlyFee, sadka: dept.sadkaFee });
        console.log('Course:', course.name, '(', course.id, ') Fees:', { monthly: course.monthlyFee, sadka: course.sadkaFee });
    } else {
        console.log('No enrollment found');
    }

    console.log('--- Plan History ---');
    if (student.planHistory.length > 0) {
        student.planHistory.forEach(h => {
            console.log('Plan:', h.plan.name, 'Fee:', h.plan.monthlyFee, 'Start:', h.startDate, 'End:', h.endDate);
        });
    } else {
        console.log('No custom plans found');
    }

    console.log('--- Invoices ---');
    console.log('Count:', student.invoices.length);
}

debug()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
