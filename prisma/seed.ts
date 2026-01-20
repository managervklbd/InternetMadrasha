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

    // 2. Teacher
    const teacherEmail = 'teacher@internetmadrasha.com'
    const teacher = await prisma.user.upsert({
        where: { email: teacherEmail },
        update: {
            status: AccountStatus.ACTIVE,
            password: password,
            role: Role.TEACHER
        },
        create: {
            email: teacherEmail,
            password: password,
            role: Role.TEACHER,
            status: AccountStatus.ACTIVE,
            teacherProfile: {
                create: {
                    fullName: "Teacher Demo",
                    gender: Gender.MALE,
                    specialization: "General",
                }
            }
        },
    })

    // Ensure profile exists if user already existed
    const existingTeacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: teacher.id } })
    if (!existingTeacherProfile) {
        await prisma.teacherProfile.create({
            data: {
                userId: teacher.id,
                fullName: "Teacher Demo",
                gender: Gender.MALE,
                specialization: "General",
            }
        })
    }

    console.log({ teacher })

    // 3. Student
    const studentEmail = 'student@internetmadrasha.com'
    const student = await prisma.user.upsert({
        where: { email: studentEmail },
        update: {
            status: AccountStatus.ACTIVE,
            password: password,
            role: Role.STUDENT
        },
        create: {
            email: studentEmail,
            password: password,
            role: Role.STUDENT,
            status: AccountStatus.ACTIVE,
            studentProfile: {
                create: {
                    fullName: "Student Demo",
                    gender: Gender.MALE,
                    studentID: "STU-2024-001",
                    mode: StudentMode.ONLINE,
                    residency: Residency.LOCAL,
                }
            }
        },
    })

    // Ensure profile exists if user already existed
    const existingStudentProfile = await prisma.studentProfile.findUnique({ where: { userId: student.id } })
    if (!existingStudentProfile) {
        // Check if ID exists to avoid collision if re-seeding partial data
        const idExists = await prisma.studentProfile.findUnique({ where: { studentID: "STU-2024-001" } })
        await prisma.studentProfile.create({
            data: {
                userId: student.id,
                fullName: "Student Demo",
                gender: Gender.MALE,
                studentID: idExists ? "STU-2024-001-B" : "STU-2024-001",
                mode: StudentMode.ONLINE,
                residency: Residency.LOCAL,
            }
        })
    }

    console.log({ student })

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
