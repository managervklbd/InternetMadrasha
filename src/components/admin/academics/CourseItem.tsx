"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronDown,
    ChevronRight,
    GraduationCap,
    Plus,
    Edit,
    Trash2,
    Check,
    X
} from "lucide-react";
import { DepartmentItem } from "./DepartmentItem";
import { cn } from "@/lib/utils";
import { createDepartment, updateDepartment, deleteDepartment, updateCourse, deleteCourse } from "@/lib/actions/academic-actions";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CourseItemProps {
    course: {
        id: string;
        name: string;
        durationMonths?: number | null;
        departments: any[];
    };
    onRefresh: () => void;
}

export function CourseItem({ course, onRefresh }: CourseItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Dept Creation State
    const [isAddingDept, setIsAddingDept] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [newDeptCode, setNewDeptCode] = useState("");
    const [loading, setLoading] = useState(false);

    // Course Edit State
    const [isEditingCourse, setIsEditingCourse] = useState(false);
    const [courseName, setCourseName] = useState(course.name);
    const [courseDuration, setCourseDuration] = useState(course.durationMonths || 12);

    // --- Dept Handlers ---
    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;

        setLoading(true);
        try {
            const res = await createDepartment(newDeptName, course.id, newDeptCode) as any;
            if (res.success) {
                toast.success("বিভাগ তৈরি সফল হয়েছে");
                setNewDeptName("");
                setNewDeptCode("");
                setIsAddingDept(false);
                onRefresh();
            } else {
                toast.error(res.error || "বিভাগ তৈরি করতে ব্যর্থ");
            }
        } catch (error) {
            toast.error("অনাকাঙ্ক্ষিত ত্রুটি");
        } finally {
            setLoading(false);
        }
    };

    const handleEditDepartment = async (id: string, newName: string) => {
        const res = await updateDepartment(id, newName) as any;
        if (res.success) {
            toast.success("বিভাগ আপডেট হয়েছে");
            onRefresh();
        } else {
            toast.error("আপডেট ব্যর্থ হয়েছে");
        }
    };

    const handleDeleteDepartment = async (id: string) => {
        const res = await deleteDepartment(id) as any;
        if (res.success) {
            toast.success("বিভাগ মুছে ফেলা হয়েছে");
            onRefresh();
        } else {
            toast.error("মুছে ফেলা ব্যর্থ হয়েছে (হয়তো এর অধীনে ব্যাচ আছে)");
        }
    };

    // --- Course Handlers ---
    const handleUpdateCourse = async () => {
        if (courseName.trim() === course.name && Number(courseDuration) === course.durationMonths) {
            setIsEditingCourse(false);
            return;
        }
        const res = await updateCourse(course.id, {
            name: courseName,
            durationMonths: Number(courseDuration)
        }) as any;
        if (res.success) {
            toast.success("কোর্স আপডেট হয়েছে");
            setIsEditingCourse(false);
            onRefresh();
        } else {
            toast.error("কোর্স আপডেট ব্যর্থ");
        }
    };

    const handleDeleteCourse = async () => {
        const res = await deleteCourse(course.id) as any;
        if (res.success) {
            toast.success("কোর্স মুছে ফেলা হয়েছে");
            onRefresh();
        } else {
            toast.error("মুছে ফেলা ব্যর্থ হয়েছে (আগে এর বিভাগগুলো মুছুন)");
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden transition-all duration-200">
            {/* Header */}
            <div
                className={cn(
                    "flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors",
                    isOpen && "bg-zinc-50 dark:bg-zinc-900/50"
                )}
                onClick={() => !isEditingCourse && setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3 flex-1">
                    {isEditingCourse ? (
                        <div className="flex items-center gap-2 p-1 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-zinc-400 ml-1">কোর্সের নাম</label>
                                <Input
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="h-9 w-64 font-bengali"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-zinc-400 ml-1">মেয়াদ (মাস)</label>
                                <Input
                                    type="number"
                                    value={courseDuration}
                                    onChange={(e) => setCourseDuration(Number(e.target.value))}
                                    className="h-9 w-24 font-bengali"
                                />
                            </div>
                            <div className="flex items-end h-16 pb-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={handleUpdateCourse}>
                                    <Check className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-500 hover:bg-zinc-100" onClick={() => setIsEditingCourse(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isOpen ? <ChevronDown className="w-5 h-5 text-zinc-400" /> : <ChevronRight className="w-5 h-5 text-zinc-400" />}
                            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-md">
                                <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold font-bengali text-zinc-800 dark:text-zinc-100">{course.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-bengali">
                                    <span>{course.departments.length} বিভাগ</span>
                                    {course.durationMonths && (
                                        <>
                                            <span>•</span>
                                            <span className="font-medium text-teal-600 dark:text-teal-400">
                                                মেয়াদ: {course.durationMonths.toLocaleString('bn-BD')} মাস
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {!isEditingCourse && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-bengali gap-2 text-teal-600 border-teal-200 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-900/20"
                            onClick={() => {
                                setIsOpen(true);
                                setIsAddingDept(true);
                            }}
                        >
                            <Plus className="w-4 h-4" /> বিভাগ যোগ
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600" onClick={() => setIsEditingCourse(true)}>
                            <Edit className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-bengali">আপনি কি এই কোর্সটি মুছে ফেলতে চান?</AlertDialogTitle>
                                    <AlertDialogDescription className="font-bengali">
                                        এই কোর্স এবং এর অধীনে থাকা সকল বিভাগ ও ব্যাচ মুছে ফেলা হবে। এই অ্যাকশনটি ফিরিয়ে আনা সম্ভব নয়।
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 font-bengali"
                                        onClick={handleDeleteCourse}
                                    >
                                        মুছে ফেলুন
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>

            {/* Body */}
            {isOpen && (
                <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20">
                    <div className="space-y-3 mt-4">
                        {/* Add Department Form */}
                        {isAddingDept && (
                            <form onSubmit={handleCreateDepartment} className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-teal-200 dark:border-teal-900 shadow-sm animate-in fade-in slide-in-from-top-2">
                                <Input
                                    className="font-bengali focus-visible:ring-teal-500"
                                    placeholder="বিভাগের নাম লিখুন..."
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    autoFocus
                                />
                                <Input
                                    className="w-32 font-mono uppercase focus-visible:ring-teal-500"
                                    placeholder="CODE (e.g. MZN)"
                                    maxLength={3}
                                    value={newDeptCode}
                                    onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                                />
                                <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bengali gap-1" disabled={loading}>
                                    {loading ? "যোগ হচ্ছে..." : "সংরক্ষণ করুন"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddingDept(false)}
                                    className="text-zinc-500"
                                >
                                    বাতিল
                                </Button>
                            </form>
                        )}

                        {/* Departments List */}
                        {course.departments.length > 0 ? (
                            course.departments.map(dept => (
                                <DepartmentItem
                                    key={dept.id}
                                    department={dept}
                                    onEdit={handleEditDepartment}
                                    onDelete={handleDeleteDepartment}
                                    onRefresh={onRefresh}
                                />
                            ))
                        ) : (
                            !isAddingDept && (
                                <p className="text-center text-sm text-zinc-400 py-4 font-bengali">
                                    এই কোর্সে কোনো বিভাগ নেই
                                </p>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
