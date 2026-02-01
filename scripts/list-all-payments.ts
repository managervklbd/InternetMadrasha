import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- ALL SSL TRANSACTIONS ---')
    const sslTransactions = await prisma.sSLCommerzTransaction.findMany({
        include: {
            invoice: {
                include: {
                    student: true
                }
            }
        }
    })
    console.log(`Total SSL Transactions: ${sslTransactions.length}`)
    sslTransactions.forEach(tx => {
        console.log(`- ID: ${tx.tranId}, Status: ${tx.status}, Student: ${tx.invoice.student.fullName} (${tx.invoice.student.email || 'N/A'}), Invoice ID: ${tx.invoiceId}`)
    })

    console.log('\n--- ALL PAID INVOICES ---')
    const paidInvoices = await prisma.monthlyInvoice.findMany({
        where: { status: 'PAID' },
        include: {
            student: true
        }
    })
    console.log(`Total Paid Invoices: ${paidInvoices.length}`)
    paidInvoices.forEach(inv => {
        console.log(`- Student: ${inv.student.fullName}, Month: ${inv.month}/${inv.year}, Amount: ${inv.amount}`)
    })

    console.log('\n--- ALL LEDGER ENTRIES ---')
    const ledgerEntries = await prisma.ledgerTransaction.findMany({
        take: 10,
        orderBy: { transactionDate: 'desc' }
    })
    ledgerEntries.forEach(le => {
        console.log(`- Date: ${le.transactionDate}, Amount: ${le.amount}, Type: ${le.fundType}, Desc: ${le.description}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
