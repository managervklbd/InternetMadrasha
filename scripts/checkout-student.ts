import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'mlsbd173@gmail.com'
    console.log(`Checking records for ${email}...`)

    const user = await prisma.user.findFirst({
        where: { email },
        include: {
            studentProfile: {
                include: {
                    invoices: {
                        include: {
                            transactions: true
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log('User Status:', user.status)
    console.log('Student ID:', user.studentProfile?.studentID)
    console.log('Active Status:', user.studentProfile?.activeStatus)

    const invoices = user.studentProfile?.invoices || []
    console.log('\nInvoices found:', invoices.length)
    invoices.forEach(inv => {
        console.log(`- Month ${inv.month}/${inv.year}: Amount ${inv.amount}, Status ${inv.status}, ID ${inv.id}`)
        inv.transactions.forEach(tx => {
            console.log(`  - Transaction: ${tx.tranId}, Status ${tx.status}, Amount ${tx.amount}`)
        })
    })

    const sslTransactions = await prisma.sSLCommerzTransaction.findMany({
        where: {
            invoice: {
                studentId: user.studentProfile?.id
            }
        }
    })
    console.log('\nSSL Transactions found:', sslTransactions.length)
    sslTransactions.forEach(tx => {
        console.log(`- Tran: ${tx.tranId}, InvoiceId: ${tx.invoiceId}, Status: ${tx.status}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
