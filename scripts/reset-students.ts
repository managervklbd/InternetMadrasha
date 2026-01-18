
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("⚠️  STARTING STUDENT DATA RESET...");
    console.log("-----------------------------------");

    // 1. Delete Dependent Data (Child Tables)
    console.log("Deleting Enrollments...");
    await prisma.enrollment.deleteMany({});

    console.log("Deleting Plan History...");
    await prisma.studentPlanHistory.deleteMany({});

    console.log("Deleting Invoices...");
    await prisma.monthlyInvoice.deleteMany({});

    console.log("Deleting Attendance...");
    await prisma.attendance.deleteMany({});

    console.log("Deleting Homework Submissions...");
    await prisma.homeworkSubmission.deleteMany({});

    console.log("Deleting Marks...");
    await prisma.mark.deleteMany({});

    console.log("Deleting Live Class Attendance...");
    await prisma.liveClassAttendance.deleteMany({});

    // 2. Delete Student Profiles
    console.log("Deleting Student Profiles...");
    await prisma.studentProfile.deleteMany({});

    // 3. Delete Student User Accounts
    console.log("Deleting User Accounts (Role: STUDENT)...");
    const { count } = await prisma.user.deleteMany({
        where: { role: "STUDENT" }
    });

    console.log("-----------------------------------");
    console.log(`✅  SUCCESSFULLY DELETED ${count} STUDENT ACCOUNTS.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
