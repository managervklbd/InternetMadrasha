
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Academic Structure...");

    const courses = await prisma.course.findMany({
        include: {
            departments: {
                include: {
                    batches: true
                }
            }
        }
    });

    console.log(JSON.stringify(courses, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
