
import { prisma } from './src/lib/db';
import { generateMonthlyInvoices } from './src/lib/actions/billing-actions';

async function main() {
    console.log("Starting invoice generation debug...");
    try {
        const result = await generateMonthlyInvoices();
        console.log("Result:", result);
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
