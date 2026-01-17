"use server";

import { prisma } from "@/lib/db";

export async function createCourse(name: string) {
    return prisma.course.create({ data: { name } });
}

export async function createDepartment(name: string, courseId: string) {
    return prisma.department.create({ data: { name, courseId } });
}

export async function getAcademicStructure() {
    return prisma.course.findMany({
        include: {
            departments: {
                include: {
                    batches: true,
                    subjects: true,
                },
            },
        },
    });
}

export async function createBatch(data: {
    name: string;
    type: "SEMESTER" | "MONTHLY";
    departmentId: string;
    allowedGender: "MALE" | "FEMALE";
    allowedMode: "ONLINE" | "OFFLINE";
}) {
    return prisma.batch.create({
        data: {
            name: data.name,
            type: data.type,
            departmentId: data.departmentId,
            allowedGender: data.allowedGender,
            allowedMode: data.allowedMode,
            active: true,
        },
    });
}
