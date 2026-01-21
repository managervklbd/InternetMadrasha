
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fixing Batch Modes...");

    // Find all ONLINE students
    const onlineStudents = await prisma.studentProfile.findMany({
        where: { mode: "ONLINE" },
        include: {
            enrollments: {
                include: { batch: true }
            }
        }
    });

    console.log(`Found ${onlineStudents.length} Online students.`);

    const batchIdsToUpdate = new Set();

    for (const student of onlineStudents) {
        for (const enrollment of student.enrollments) {
            if (enrollment.batch.allowedMode !== "ONLINE") {
                console.log(`- Student ${student.studentID} is in OFFLINE batch: ${enrollment.batch.name}`);
                batchIdsToUpdate.add(enrollment.batch.id);
            }
        }
    }

    if (batchIdsToUpdate.size === 0) {
        console.log("No batches need updating.");
        return;
    }

    console.log(`Updating ${batchIdsToUpdate.size} batches to ONLINE mode...`);

    const updateResult = await prisma.batch.updateMany({
        where: {
            id: { in: Array.from(batchIdsToUpdate) }
        },
        data: {
            allowedMode: "ONLINE"
        }
    });

    console.log(`Updated ${updateResult.count} batches.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
