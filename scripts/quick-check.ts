import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const students = await prisma.studentProfile.findMany({
        include: {
            enrollments: true,
            invoices: true
        }
    })
    students.forEach(s => {
        console.log(`Student: ${s.fullName} (${s.studentID})`)
        console.log(`  Active: ${s.activeStatus}`)
        console.log(`  Enrollments Paid: ${s.enrollments.map(e => e.isAdmissionFeePaid)}`)
        console.log(`  Invoices: ${s.invoices.length} total`)
        s.invoices.forEach(inv => {
            console.log(`    - Month ${inv.month}/${inv.year}: ${inv.status}, ID: ${inv.id}`)
        })
    })
}
main().finally(() => prisma.$disconnect())
