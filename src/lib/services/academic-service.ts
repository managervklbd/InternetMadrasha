import { prisma } from "@/lib/db";

export const academicService = {
    // Course
    async createCourse(name: string) {
        return prisma.course.create({ data: { name } });
    },
    async getCourses() {
        return prisma.course.findMany({ include: { departments: true } });
    },

    // Department
    async createDepartment(name: string, courseId: string) {
        return prisma.department.create({ data: { name, courseId } });
    },

    // Semester
    async createSemester(name: string, departmentId: string) {
        return prisma.semester.create({ data: { name, departmentId } });
    },

    // Batch (Unified)
    async createBatch(data: {
        name: string;
        type: "SEMESTER" | "MONTHLY";
        gender: "MALE" | "FEMALE";
        semesterId?: string;
    }) {
        return prisma.batch.create({
            data: {
                name: data.name,
                type: data.type,
                gender: data.gender,
                semesterId: data.semesterId,
            },
        });
    },

    async getBatches() {
        return prisma.batch.findMany({
            include: {
                semester: {
                    include: {
                        department: {
                            include: { course: true },
                        },
                    },
                },
                _count: { select: { students: true } },
            },
        });
    },
};
