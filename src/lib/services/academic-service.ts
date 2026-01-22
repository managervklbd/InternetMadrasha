import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export const academicService = {
    // Course
    async createCourse(name: string) {
        const course = await prisma.course.create({ data: { name } });
        await logAdminAction("CREATE_COURSE", "Course", course.id, { name });
        return course;
    },
    async getCourses() {
        return prisma.course.findMany({ include: { departments: true } });
    },

    // Department
    async createDepartment(name: string, courseId: string) {
        const dept = await prisma.department.create({ data: { name, courseId } });
        await logAdminAction("CREATE_DEPARTMENT", "Department", dept.id, { name, courseId });
        return dept;
    },

    // Semester - MODEL DOES NOT EXIST
    // async createSemester(name: string, departmentId: string) {
    //     const sem = await prisma.semester.create({ data: { name, departmentId } });
    //     await logAdminAction("CREATE_SEMESTER", "Semester", sem.id, { name, departmentId });
    //     return sem;
    // },

    // Batch (Unified) - BROKEN / LEGACY CODE (Mismatch with Schema)
    // async createBatch(data: {
    //     name: string;
    //     type: "SEMESTER" | "MONTHLY";
    //     gender: "MALE" | "FEMALE";
    //     semesterId?: string;
    // }) {
    //     const batch = await prisma.batch.create({
    //         data: {
    //             name: data.name,
    //             type: data.type,
    //             gender: data.gender,
    //             semesterId: data.semesterId,
    //             // departmentId is required but missing in arg
    //         },
    //     });
    //     await logAdminAction("CREATE_BATCH", "Batch", batch.id, { name: data.name });
    //     return batch;
    // },

    // async getBatches() {
    //     return prisma.batch.findMany({
    //         include: {
    //             // semester: { ... } // Semester model does not exist
    //             enrollments: true, // was _count students
    //         },
    //     });
    // },
};
