
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching student details...");

    // Fetch all students with their enrollments and batches
    const students = await prisma.studentProfile.findMany({
        include: {
            user: true,
            enrollments: {
                include: {
                    batch: {
                        include: {
                            department: true
                        }
                    }
                }
            }
        }
    });

    console.log(`Found ${students.length} students.`);

    for (const student of students) {
        console.log(`\nStudent: ${student.user.name} (${student.studentID})`);
        console.log(`- Mode: ${student.mode}`);

        if (student.enrollments.length === 0) {
            console.log("- No enrollments found.");
            continue;
        }

        for (const enrollment of student.enrollments) {
            const batch = enrollment.batch;
            console.log(`- Enrolled in Batch: ${batch.name} (Dept: ${batch.department.name})`);
            console.log(`  - Batch Allowed Mode: ${batch.allowedMode}`);
            console.log(`  - Match? ${student.mode === batch.allowedMode ? "YES" : "NO"}`);
        }
    }

    // Also check available sessions for today
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const sessions = await prisma.classSession.findMany({
        where: {
            date: {
                gte: todayStart,
                lte: todayEnd
            }
        },
        include: {
            batch: true
        }
    });

    console.log(`\nFound ${sessions.length} sessions for today.`);
    for (const session of sessions) {
        console.log(`- Session: ${session.date.toLocaleTimeString()} for Batch: ${session.batch.name} (${session.batch.allowedMode})`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
