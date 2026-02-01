import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const student = await prisma.studentProfile.findFirst({
        where: {
            user: { email: 'mlsbd173@gmail.com' }
        },
        include: {
            invoices: { orderBy: { month: 'asc' } },
            enrollments: true,
            user: true
        }
    })
    if (!student) {
        console.log('Student not found')
        // Try by partial match if exact email fails
        const all = await prisma.user.findMany({ where: { email: { contains: 'mlsbd173' } } })
        console.log('Suggestions:', all.map(u => u.email))
        return
    }
    console.log(`Student: ${student.fullName}`)
    console.log(`User Email: ${student.user.email}`)
    console.log(`Enrollments Paid: ${student.enrollments.map(e => e.isAdmissionFeePaid)}`)
    console.log('Invoices:')
    student.invoices.forEach(i => {
        console.log(`  - Month ${i.month}/${i.year}: ${i.status} (Amount: ${i.amount})`)
    })
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
