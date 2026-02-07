"use server";

import { prisma } from "@/lib/db";
import { BatchType, Gender, StudentMode } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createCourse(data: {
    name: string;
    monthlyFee?: number;
    admissionFee?: number;
    durationMonths?: number;
    isSingleCourse?: boolean;
    allowedMode?: StudentMode;
    startDate?: Date;
    endDate?: Date;
    monthlyFeeOffline?: number;
    admissionFeeOffline?: number;
    admissionFeeProbashi?: number;
    monthlyFeeProbashi?: number;
    examFee?: number;
    registrationFee?: number;
    otherFee?: number;
    examFeeOffline?: number;
    registrationFeeOffline?: number;
    otherFeeOffline?: number;
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
                durationMonths: data.durationMonths,
                monthlyFeeOffline: data.monthlyFeeOffline,
                admissionFeeOffline: data.admissionFeeOffline,
                admissionFeeProbashi: data.admissionFeeProbashi,
                monthlyFeeProbashi: data.monthlyFeeProbashi,
                sadkaFee: 0, // Default
                examFee: data.examFee,
                registrationFee: data.registrationFee,
                otherFee: data.otherFee,
                examFeeOffline: data.examFeeOffline,
                registrationFeeOffline: data.registrationFeeOffline,
                otherFeeOffline: data.otherFeeOffline
            }
        });

        // Auto-create structure for Single Course
        if (data.isSingleCourse) {
            const dept = await prisma.department.create({
                data: {
                    name: `${data.name} বিভাগ`, // Named after the course
                    code: data.name.substring(0, 3).toUpperCase(),
                    courseId: course.id,
                    monthlyFee: data.monthlyFee,
                    admissionFee: data.admissionFee,
                    monthlyFeeOffline: data.monthlyFeeOffline,
                    admissionFeeOffline: data.admissionFeeOffline,
                    admissionFeeProbashi: data.admissionFeeProbashi,
                    monthlyFeeProbashi: data.monthlyFeeProbashi
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
                    name: `১ম ব্যাচ (${data.allowedMode === "ONLINE" ? "অনলাইন" : "অফলাইন"})`,
                    type: BatchType.MONTHLY,
                    departmentId: dept.id,
                    allowedGender: Gender.MALE,
                    allowedMode: data.allowedMode || StudentMode.OFFLINE,
                    active: true,
                    monthlyFee: data.monthlyFee,
                    admissionFee: data.admissionFee,
                    monthlyFeeOffline: data.monthlyFeeOffline,
                    admissionFeeOffline: data.admissionFeeOffline,
                    admissionFeeProbashi: data.admissionFeeProbashi,
                    monthlyFeeProbashi: data.monthlyFeeProbashi,
                    startDate: startDate,
                    endDate: endDate
                }
            });
        }

        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
        return { success: true, data: course };
    } catch (error: any) {
        console.error("Error creating course:", error);
        if (error.code === 'P2002') {
            return { success: false, error: "এই নামের কোর্সটি ইতিমধ্যে বিদ্যমান।" };
        }
        return { success: false, error: "কোর্স তৈরি করতে ব্যর্থ হয়েছে।" };
    }
}

export async function createDepartment(name: string, courseId: string, code?: string, fees?: {
    monthlyFee?: number;
    admissionFee?: number;
    monthlyFeeOffline?: number;
    admissionFeeOffline?: number;
    admissionFeeProbashi?: number;
    monthlyFeeProbashi?: number;
    examFee?: number;
    registrationFee?: number;
    otherFee?: number;
    examFeeOffline?: number;
    registrationFeeOffline?: number;
    otherFeeOffline?: number;
}) {
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
                code: deptCode,
                ...fees
            }
        });
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
        return { success: true, data: department };
    } catch (error: any) {
        return { success: false, error: "বিভাগ তৈরি করতে ব্যর্থ হয়েছে।" };
    }
}

import { cache } from "react";

export const getAcademicStructure = cache(async function (mode?: StudentMode) {
    try {
        const courses = await prisma.course.findMany({
            where: {}, // Fetch all courses first
            include: {
                departments: {
                    include: {
                        batches: {
                            where: mode ? { allowedMode: mode } : undefined,
                            include: {
                                batchSubjects: {
                                    include: { subject: true }
                                },
                                teachers: true
                            }
                        },
                        subjects: true,
                    },
                },
            },
        });

        // Filter out courses that have no batches matching the mode
        if (mode) {
            return courses.filter(course =>
                course.departments.some(dept => dept.batches.length > 0)
            );
        }

        return courses;
    } catch (error) {
        console.error("Critical Error in getAcademicStructure:", error);
        throw error;
    }
});

export const getBatches = cache(async function () {
    try {
        return await prisma.batch.findMany({
            where: { active: true },
            select: {
                id: true,
                name: true,
                allowedMode: true,
                department: {
                    select: {
                        name: true,
                        course: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                department: {
                    course: {
                        name: 'asc'
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error in getBatches:", error);
        throw error;
    }
});

export async function getAllBatches() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    return prisma.batch.findMany({
        where: { active: true },
        select: {
            id: true,
            name: true,
            allowedMode: true,
            department: {
                select: {
                    name: true,
                    course: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            department: {
                course: {
                    name: 'asc'
                }
            }
        }
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
    monthlyFee?: number;
    admissionFee?: number;
    monthlyFeeOffline?: number;
    admissionFeeOffline?: number;
    admissionFeeProbashi?: number;
    monthlyFeeProbashi?: number;
    examFee?: number;
    registrationFee?: number;
    otherFee?: number;
    examFeeOffline?: number;
    registrationFeeOffline?: number;
    otherFeeOffline?: number;
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
                endDate: data.endDate,
                monthlyFee: data.monthlyFee,
                admissionFee: data.admissionFee,
                monthlyFeeOffline: data.monthlyFeeOffline,
                admissionFeeOffline: data.admissionFeeOffline,
                admissionFeeProbashi: data.admissionFeeProbashi,
                monthlyFeeProbashi: data.monthlyFeeProbashi,
                examFee: data.examFee,
                registrationFee: data.registrationFee,
                otherFee: data.otherFee,
                examFeeOffline: data.examFeeOffline,
                registrationFeeOffline: data.registrationFeeOffline,
                otherFeeOffline: data.otherFeeOffline
            },
        });
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
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
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error deleting batch:", error);
        return { success: false, error: "Failed to delete semester" };
    }
}

// --- Update & Delete Actions for Course & Dept ---

export async function updateCourse(id: string, data: {
    name: string;
    monthlyFee?: number;
    admissionFee?: number;
    sadkaFee?: number;
    monthlyFeeOffline?: number;
    sadkaFeeOffline?: number;
    admissionFeeOffline?: number;
    durationMonths?: number;
    admissionFeeProbashi?: number;
    monthlyFeeProbashi?: number;
    examFee?: number;
    registrationFee?: number;
    otherFee?: number;
    examFeeOffline?: number;
    registrationFeeOffline?: number;
    otherFeeOffline?: number;
}) {
    if (!id || !data.name) return { success: false, error: "ID and Name required" };
    try {
        await prisma.course.update({
            where: { id },
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                admissionFee: data.admissionFee,
                sadkaFee: data.sadkaFee,
                monthlyFeeOffline: data.monthlyFeeOffline,
                sadkaFeeOffline: data.sadkaFeeOffline,
                admissionFeeOffline: data.admissionFeeOffline,
                durationMonths: data.durationMonths,
                admissionFeeProbashi: data.admissionFeeProbashi,
                monthlyFeeProbashi: data.monthlyFeeProbashi,
                examFee: data.examFee,
                registrationFee: data.registrationFee,
                otherFee: data.otherFee,
                examFeeOffline: data.examFeeOffline,
                registrationFeeOffline: data.registrationFeeOffline,
                otherFeeOffline: data.otherFeeOffline
            }
        });
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
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
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error deleting course:", error);
        return { success: false, error: "Failed to delete course (ensure it has no departments/batches)" };
    }
}

export async function updateDepartment(id: string, data: {
    name: string;
    monthlyFee?: number;
    sadkaFee?: number;
    admissionFee?: number;
    monthlyFeeOffline?: number;
    sadkaFeeOffline?: number;
    admissionFeeOffline?: number;
    admissionFeeProbashi?: number;
    monthlyFeeProbashi?: number;
    examFee?: number;
    registrationFee?: number;
    otherFee?: number;
    examFeeOffline?: number;
    registrationFeeOffline?: number;
    otherFeeOffline?: number;
}) {
    if (!id || !data.name) return { success: false, error: "ID and Name required" };
    try {
        await prisma.department.update({
            where: { id },
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                sadkaFee: data.sadkaFee,
                admissionFee: data.admissionFee,
                monthlyFeeOffline: data.monthlyFeeOffline,
                sadkaFeeOffline: data.sadkaFeeOffline,
                admissionFeeOffline: data.admissionFeeOffline,
                admissionFeeProbashi: data.admissionFeeProbashi,
                monthlyFeeProbashi: data.monthlyFeeProbashi,
                examFee: data.examFee,
                registrationFee: data.registrationFee,
                otherFee: data.otherFee,
                examFeeOffline: data.examFeeOffline,
                registrationFeeOffline: data.registrationFeeOffline,
                otherFeeOffline: data.otherFeeOffline
            }
        });
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
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
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error deleting department:", error);
        return { success: false, error: "Failed to delete department (ensure it has no batches)" };
    }
}

export async function updateBatch(id: string, data: {
    name: string;
    monthlyFee?: number;
    sadkaFee?: number;
    admissionFee?: number;
    monthlyFeeOffline?: number;
    sadkaFeeOffline?: number;
    admissionFeeOffline?: number;
    allowedMode?: StudentMode;
    startDate?: Date;
    endDate?: Date;
    admissionFeeProbashi?: number;
    monthlyFeeProbashi?: number;
    examFee?: number;
    registrationFee?: number;
    otherFee?: number;
    examFeeOffline?: number;
    registrationFeeOffline?: number;
    otherFeeOffline?: number;
}) {
    if (!id || !data.name) return { success: false, error: "ID and Name required" };
    try {
        await prisma.batch.update({
            where: { id },
            data: {
                name: data.name,
                monthlyFee: data.monthlyFee,
                sadkaFee: data.sadkaFee,
                admissionFee: data.admissionFee,
                monthlyFeeOffline: data.monthlyFeeOffline,
                sadkaFeeOffline: data.sadkaFeeOffline,
                admissionFeeOffline: data.admissionFeeOffline,
                allowedMode: data.allowedMode,
                startDate: data.startDate,
                endDate: data.endDate,
                admissionFeeProbashi: data.admissionFeeProbashi,
                monthlyFeeProbashi: data.monthlyFeeProbashi,
                examFee: data.examFee,
                registrationFee: data.registrationFee,
                otherFee: data.otherFee,
                examFeeOffline: data.examFeeOffline,
                registrationFeeOffline: data.registrationFeeOffline,
                otherFeeOffline: data.otherFeeOffline
            }
        });
        revalidatePath("/admin/billing");
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error updating batch:", error);
        return { success: false, error: "Failed to update semester" };
    }
}

// --- Subject Actions ---

export async function createSubject(name: string, departmentId: string, batchId?: string) {
    if (!name || !departmentId) {
        return { success: false, error: "নাম এবং বিভাগ আবশ্যক।" };
    }
    try {
        const names = name.split(',').map(n => n.trim()).filter(n => n !== "");

        for (const subName of names) {
            const subject = await prisma.subject.create({
                data: {
                    name: subName,
                    departmentId
                }
            });

            if (batchId) {
                await prisma.batchSubject.create({
                    data: {
                        batchId,
                        subjectId: subject.id
                    }
                });
            }
        }

        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error creating subject:", error);
        return { success: false, error: "বিষয় তৈরি করতে ব্যর্থ হয়েছে।" };
    }
}

export async function updateSubject(id: string, name: string) {
    if (!id || !name) return { success: false, error: "আইডি এবং নাম আবশ্যক" };
    try {
        await prisma.subject.update({
            where: { id },
            data: { name }
        });
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error updating subject:", error);
        return { success: false, error: "বিষয় আপডেট করতে ব্যর্থ হয়েছে।" };
    }
}

export async function deleteSubject(id: string) {
    if (!id) return { success: false, error: "আইডি আবশ্যক" };
    try {
        await prisma.subject.delete({ where: { id } });
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error deleting subject:", error);
        return { success: false, error: "বিষয় মুছে ফেলতে ব্যর্থ হয়েছে। নিশ্চিত করুন এটি কোনো ব্যাচে যুক্ত নেই।" };
    }
}

export async function toggleBatchSubject(batchId: string, subjectId: string, active: boolean) {
    try {
        if (active) {
            await prisma.batchSubject.upsert({
                where: {
                    batchId_subjectId: { batchId, subjectId }
                },
                update: {},
                create: { batchId, subjectId }
            });
        } else {
            await prisma.batchSubject.deleteMany({
                where: { batchId, subjectId }
            });
        }
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error toggling batch subject:", error);
        return { success: false, error: "ব্যাচ বিষয় আপডেট করতে ব্যর্থ হয়েছে।" };
    }
}
export async function assignTeachersToBatch(batchId: string, teacherIds: string[]) {
    if (!batchId) return { success: false, error: "Batch ID required" };
    try {
        await prisma.batch.update({
            where: { id: batchId },
            data: {
                teachers: {
                    set: teacherIds.map(id => ({ id }))
                }
            }
        });
        revalidatePath("/admin/academics");
        return { success: true };
    } catch (error) {
        console.error("Error assigning teachers:", error);
        return { success: false, error: "Failed to assign teachers" };
    }
}
