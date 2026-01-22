import { PrismaClient, Role, AccountStatus, Gender, StudentMode, Residency } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('123456', 10) // Default password for all: 123456

    // 1. Admin
    const adminEmail = 'admin@internetmadrasha.com'
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            status: AccountStatus.ACTIVE,
            password: password,
            role: Role.ADMIN
        },
        create: {
            email: adminEmail,
            password: password,
            role: Role.ADMIN,
            status: AccountStatus.ACTIVE,
        },
    })
    console.log({ admin })


    // 4. Site Settings
    const settings = await prisma.siteSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            madrasaName: "তালিমুল কুরআন ওয়াস সুন্নাহ ইন্টারনেট মাদ্রাসা",
            siteActive: true,
            // Default SMTP/Payment settings can be left null or set to defaults here
        }
    })
    console.log({ settings })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
