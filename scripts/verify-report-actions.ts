
import dotenv from 'dotenv';
dotenv.config();
import { getAdminOverviewStats, getFinancialSummary, getStudentDemographics, getAttendanceStats } from '../src/lib/actions/report-actions';
import { prisma } from '../src/lib/db';

async function verify() {
    console.log("Verifying Report Actions...");

    try {
        const startOverview = Date.now();
        const overview = await getAdminOverviewStats();
        console.log(`getAdminOverviewStats took ${Date.now() - startOverview}ms`);
        console.log("Overview keys:", Object.keys(overview));

        const startFinancial = Date.now();
        const financial = await getFinancialSummary();
        console.log(`getFinancialSummary took ${Date.now() - startFinancial}ms`);
        console.log("Financial keys:", Object.keys(financial));

        const startDemographics = Date.now();
        const demographics = await getStudentDemographics();
        console.log(`getStudentDemographics took ${Date.now() - startDemographics}ms`);
        console.log("Demographics keys:", Object.keys(demographics));

        const startAttendance = Date.now();
        const attendance = await getAttendanceStats();
        console.log(`getAttendanceStats took ${Date.now() - startAttendance}ms`);
        console.log("Attendance keys:", Object.keys(attendance));

        console.log("\nAll checks passed!");
    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
