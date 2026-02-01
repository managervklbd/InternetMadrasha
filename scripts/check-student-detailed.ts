import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const student = await prisma.studentProfile.findFirst({
        where: { user: { email: 'mlsbd173@gmail.com' } },
        include: { invoices: true, user: true }
    })
    if (!student) return console.log('Student not found')
    console.log(`Invoices for ${student.fullName} (${student.user.email}):`)
    for (const inv of student.invoices) {
        const txs = await prisma.sSLCommerzTransaction.findMany({ where: { invoiceId: inv.id } })
        const ledger = await prisma.ledgerTransaction.findMany({ where: { invoiceId: inv.id } })
        console.log(`- ${inv.month}/${inv.year}: status=${inv.status}, amount=${inv.amount}, transactions=${txs.length}, ledgerEntries=${ledger.length}`)
    }
}
main().finally(() => prisma.$disconnect())
