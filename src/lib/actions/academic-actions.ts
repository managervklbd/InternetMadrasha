"use server";

import { prisma } from "@/lib/db";
import { BatchType, Gender, StudentMode } from "@prisma/client";

export async function createCourse(data: {
    name: string;
    monthlyFee?: number;
    admissionFee?: number;
    durationMonths?: number;
    isSingleCourse?: boolean;
    startDate?: Date;
    endDate?: Date;
}) {
    if (!data.name || data.name.trim() === "") {
        return { success: false, error: "কোর্সের নাম আবশ্যক।" };
    }
    try {
        const course = await prisma.course.create({
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                admissionFee: data.admissionFee,
                durationMonths: data.durationMonths
            }
        });

        // Auto-create structure for Single Course
        if (data.isSingleCourse) {
            const dept = await prisma.department.create({
                data: {
                    name: "সাধারণ বিভাগ", // General Department
                    code: "GEN",
                    courseId: course.id,
                    monthlyFee: data.monthlyFee,
                    admissionFee: data.admissionFee
                }
            });

            let startDate = data.startDate || new Date();
            let endDate = data.endDate;

            if (!endDate && data.durationMonths) {
                // Calculate end date based on duration
                const end = new Date(startDate);
                end.setMonth(end.getMonth() + data.durationMonths);
                endDate = end;
            }

            await prisma.batch.create({
                data: {
                    name: "ডিফল্ট ব্যাচ", // Default Batch
                    type: BatchType.MONTHLY,
                    departmentId: dept.id,
                    allowedGender: Gender.MALE, // Default, can be changed
                    allowedMode: StudentMode.OFFLINE,
                    active: true,
                    monthlyFee: data.monthlyFee,
                    admissionFee: data.admissionFee,
                    startDate: startDate,
                    endDate: endDate
                }
            });
        }

        return { success: true, data: course };
    } catch (error: any) {
        console.error("Error creating course:", error);
        if (error.code === 'P2002') {
            return { success: false, error: "এই নামের কোর্সটি ইতিমধ্যে বিদ্যমান।" };
        }
        return { success: false, error: "কোর্স তৈরি করতে ব্যর্থ হয়েছে।" };
    }
}

export async function createDepartment(name: string, courseId: string, code?: string) {
    if (!name || !courseId) {
        return { success: false, error: "বিভাগের নাম এবং কোর্স আবশ্যক।" };
    }
    try {
        let deptCode = code;
        if (!deptCode) {
            const englishChars = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
            deptCode = englishChars.length >= 3 ? englishChars.substring(0, 3) : "DEP";
        }

        const department = await prisma.department.create({
            data: {
                name,
                courseId,
                code: deptCode // Updated property
            }
        });
        return { success: true, data: department };
    } catch (error: any) {
        return { success: false, error: "বিভাগ তৈরি করতে ব্যর্থ হয়েছে।" };
    }
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

// --- Batch (Semester) Actions ---

export async function createBatch(data: {
    name: string;
    type: "SEMESTER" | "MONTHLY";
    departmentId: string;
    allowedGender: "MALE" | "FEMALE";
    allowedMode: "ONLINE" | "OFFLINE";
    startDate?: Date;
    endDate?: Date;
}) {
    if (!data.name || !data.departmentId) {
        return { success: false, error: "Name and Department ID are required" };
    }

    try {
        const batch = await prisma.batch.create({
            data: {
                name: data.name,
                type: data.type === "SEMESTER" ? BatchType.SEMESTER : BatchType.MONTHLY,
                departmentId: data.departmentId,
                allowedGender: data.allowedGender === "MALE" ? Gender.MALE : Gender.FEMALE,
                allowedMode: data.allowedMode === "ONLINE" ? StudentMode.ONLINE : StudentMode.OFFLINE,
                active: true,
                startDate: data.startDate,
                endDate: data.endDate
            },
        });
        return { success: true, data: batch };
    } catch (error: any) {
        console.error("Error creating batch:", error);
        return { success: false, error: error.message || "Failed to create semester" };
    }
}

export async function deleteBatch(id: string) {
    if (!id) return { success: false, error: "ID required" };
    try {
        await prisma.batch.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Error deleting batch:", error);
        return { success: false, error: "Failed to delete semester" };
    }
}

// --- Update & Delete Actions for Course & Dept ---

// --- Update & Delete Actions for Course & Dept ---

export async function updateCourse(id: string, data: {
    name: string;
    monthlyFee?: number;
    admissionFee?: number;
    durationMonths?: number;
}) {
    if (!id || !data.name) return { success: false, error: "ID and Name required" };
    try {
        await prisma.course.update({
            where: { id },
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                admissionFee: data.admissionFee,
                durationMonths: data.durationMonths
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating course:", error);
        return { success: false, error: "Failed to update course" };
    }
}

export async function deleteCourse(id: string) {
    if (!id) return { success: false, error: "ID required" };
    try {
        await prisma.course.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Error deleting course:", error);
        return { success: false, error: "Failed to delete course (ensure it has no departments/batches)" };
    }
}

export async function updateDepartment(id: string, name: string) {
    if (!id || !name) return { success: false, error: "ID and Name required" };
    try {
        await prisma.department.update({
            where: { id },
            data: {
                name,
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating department:", error);
        return { success: false, error: "Failed to update department" };
    }
}

export async function deleteDepartment(id: string) {
    if (!id) return { success: false, error: "ID required" };
    try {
        await prisma.department.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Error deleting department:", error);
        return { success: false, error: "Failed to delete department (ensure it has no batches)" };
    }
}

export async function updateBatch(id: string, data: {
    name: string;
    monthlyFee?: number;
    startDate?: Date;
    endDate?: Date;
}) {
    if (!id || !data.name) return { success: false, error: "ID and Name required" };
    try {
        await prisma.batch.update({
            where: { id },
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                startDate: data.startDate,
                endDate: data.endDate
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating batch:", error);
        return { success: false, error: "Failed to update semester" };
    }
}
