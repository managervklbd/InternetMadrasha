
import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/lib/db';
import { syncStudentMonthlyInvoice } from '../src/lib/actions/billing-actions';
import { provisionStudent } from '../src/lib/actions/student-actions';

async function verifyAdmissionFee() {
    console.log("Verifying Admission Fee Flow...");

    // 1. Setup Test Data
    const course = await prisma.course.create({
        data: {
            name: `Test Course ${Date.now()}`,
            monthlyFee: 1000,
            admissionFee: 500,
        }
    });

    const dept = await prisma.department.create({
        data: {
            name: "Test Dept",
            courseId: course.id,
            monthlyFee: 1000,
            admissionFee: 500,
        }
    });

    const batch = await prisma.batch.create({
        data: {
            name: "Test Batch",
            departmentId: dept.id,
            allowedGender: "MALE",
            allowedMode: "OFFLINE",
            monthlyFee: 1000,
            monthlyFeeOffline: 1000,
            admissionFee: 500,
            admissionFeeOffline: 500,
        }
    });

    console.log(`Created structure: Course=${course.name}, Batch=${batch.name} (Adm: ${batch.admissionFee}, Monthly: ${batch.monthlyFee})`);

    // 2. Enroll Student
    const studentId = `ST-${Date.now()}`;
    const { student } = await provisionStudent({
        email: `test-${studentId}@example.com`,
        fullName: "Test Student",
        studentID: studentId,
        gender: "MALE",
        mode: "OFFLINE",
        residency: "LOCAL",
        batchId: batch.id
    });

    console.log(`Enrolled student: ${student.fullName} (${student.id})`);

    // 3. Verify Admission Invoice
    const inv0 = await prisma.monthlyInvoice.findFirst({
        where: { studentId: student.id, month: 0 }
    });

    if (inv0 && inv0.amount === 500 && inv0.status === 'UNPAID') {
        console.log("✅ Check 1 Passed: Admission Invoice found (Month 0, Amount 500)");
    } else {
        console.error("❌ Check 1 Failed: Admission Invoice mismatch", inv0);
        return;
    }

    // 4. Verify No Monthly Invoice Yet (Should not exist or be 0? Logic says targetMonth=0 if admission unpaid)
    // Actually, syncStudentMonthlyInvoice returns one result. It prioritizes admission.
    // Let's check if a current month invoice exists (should NOT)
    const date = new Date();
    const invCurrent = await prisma.monthlyInvoice.findFirst({
        where: { studentId: student.id, month: date.getMonth() + 1 }
    });

    if (!invCurrent) {
        console.log("✅ Check 2 Passed: No monthly invoice yet (blocked by admission fee)");
    } else {
        console.error("❌ Check 2 Failed: Monthly invoice generated prematurely!", invCurrent);
    }

    // 5. Pay Admission Fee
    await prisma.monthlyInvoice.update({
        where: { id: inv0.id },
        data: { status: 'PAID' }
    });
    console.log("Paid Admission Invoice manually.");

    // 6. Sync Again
    console.log("Syncing invoices again...");
    await syncStudentMonthlyInvoice(student.id);

    // 7. Verify Enrollment Flag and Monthly Invoice
    const updatedEnrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id }
    });

    if (updatedEnrollment?.isAdmissionFeePaid) {
        console.log("✅ Check 3 Passed: Enrollment marked as isAdmissionFeePaid = true");
    } else {
        console.error("❌ Check 3 Failed: Enrollment NOT marked as paid");
    }

    const invMonthly = await prisma.monthlyInvoice.findFirst({
        where: { studentId: student.id, month: date.getMonth() + 1 }
    });

    if (invMonthly && invMonthly.amount === 1000) {
        console.log("✅ Check 4 Passed: Monthly Invoice generated (Amount 1000)");
    } else {
        console.error("❌ Check 4 Failed: Monthly invoice missing or wrong amount", invMonthly);
    }

    // Cleanup
    await prisma.monthlyInvoice.deleteMany({ where: { studentId: student.id } });
    await prisma.enrollment.deleteMany({ where: { studentId: student.id } });
    await prisma.studentProfile.delete({ where: { id: student.id } });
    await prisma.user.delete({ where: { email: `test-${studentId}@example.com` } });
    await prisma.batch.delete({ where: { id: batch.id } });
    await prisma.department.delete({ where: { id: dept.id } });
    await prisma.course.delete({ where: { id: course.id } });

    console.log("Cleanup done.");
}

verifyAdmissionFee().catch(console.error).finally(() => prisma.$disconnect());
