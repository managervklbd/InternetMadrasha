"use client";

import { useState, useEffect } from "react";
import {
    getAcademicStructure,
    createSubject,
    updateSubject,
    deleteSubject,
    toggleBatchSubject
} from "@/lib/actions/academic-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ListChecks, ArrowRight, ChevronRight, Book } from "lucide-react";

interface Props {
    initialMode?: "ONLINE" | "OFFLINE";
}

export function SubjectManager({ initialMode }: Props) {
    const [structure, setStructure] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

    // Subject Dialog State
    const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<{ id: string, name: string } | null>(null);
    const [newSubjectName, setNewSubjectName] = useState("");
    const [processing, setProcessing] = useState(false);

    const refreshData = async () => {
        setLoading(true);
        try {
            const data = await getAcademicStructure(initialMode);
            setStructure(data);
        } catch (err) {
            console.error(err);
            toast.error("তথ্য লোড করতে ব্যর্থ হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [initialMode]);

    const handleSaveSubject = async () => {
        if (!newSubjectName.trim() || !selectedDept) return;
        setProcessing(true);
        try {
            let res;
            if (editingSubject) {
                res = await updateSubject(editingSubject.id, newSubjectName);
            } else {
                res = await createSubject(newSubjectName, selectedDept, selectedBatch || undefined);
            }

            if (res.success) {
                toast.success(editingSubject ? "বিষয় আপডেট হয়েছে" : "নতুন বিষয় যোগ হয়েছে");
                setIsSubjectDialogOpen(false);
                setNewSubjectName("");
                setEditingSubject(null);
                refreshData();
            } else {
                toast.error(res.error || "ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই বিষয়টি মুছে ফেলতে চান?")) return;
        try {
            const res = await deleteSubject(id);
            if (res.success) {
                toast.success("বিষয় মুছে ফেলা হয়েছে");
                refreshData();
            } else {
                toast.error(res.error || "মুছে ফেলা অসম্ভব (হয়তো কোনো ব্যাচে যুক্ত আছে)");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        }
    };

    const handleToggleBatchSubject = async (subjectId: string, active: boolean) => {
        if (!selectedBatch) return;
        try {
            const res = await toggleBatchSubject(selectedBatch, subjectId, active);
            if (res.success) {
                refreshData();
            } else {
                toast.error(res.error || "পরিবর্তন ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        }
    };

    const currentCourse = structure.find(c => c.id === selectedCourse);
    const currentDept = currentCourse?.departments?.find((d: any) => d.id === selectedDept);
    const currentBatch = currentDept?.batches?.find((b: any) => b.id === selectedBatch);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar: Course & Department Selection */}
            <Card className="lg:col-span-4 border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-lg font-bengali flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-teal-600" />
                        মারহালা ও বিভাগ নির্বাচন
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    {loading && <div className="text-center py-10 text-zinc-400 font-bengali">লোড হচ্ছে...</div>}
                    {!loading && structure.map(course => (
                        <div key={course.id} className="space-y-2">
                            <button
                                onClick={() => {
                                    setSelectedCourse(course.id === selectedCourse ? null : course.id);
                                    setSelectedDept(null);
                                    setSelectedBatch(null);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${selectedCourse === course.id
                                    ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                                    }`}
                            >
                                <span className="font-bold font-bengali">{course.name}</span>
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedCourse === course.id ? "rotate-90" : ""}`} />
                            </button>

                            {selectedCourse === course.id && (
                                <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                    {course.departments.map((dept: any) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => {
                                                setSelectedDept(dept.id);
                                                setSelectedBatch(null);
                                            }}
                                            className={`w-full text-left p-2 rounded-md text-sm font-bengali transition-colors flex items-center gap-2 ${selectedDept === dept.id
                                                ? "bg-zinc-200 dark:bg-zinc-700 font-bold"
                                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            <ArrowRight className="w-3 h-3" />
                                            {dept.name}
                                        </button>
                                    ))}
                                    {course.departments.length === 0 && (
                                        <div className="text-xs text-zinc-400 italic p-2 font-bengali">কোনো বিভাগ নেই</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Main Workspace: Subject Management */}
            <div className="lg:col-span-8 space-y-6">
                {!selectedDept ? (
                    <Card className="h-full border-dashed border-2 flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="text-center space-y-3">
                            <Book className="w-12 h-12 text-zinc-300 mx-auto" />
                            <p className="text-zinc-400 font-bengali">বাম পাশ থেকে একটি বিভাগ নির্বাচন করুন।</p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Batch Connection */}
                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader className="border-b bg-teal-50/50 dark:bg-teal-900/10">
                                <CardTitle className="text-lg font-bengali flex items-center gap-2">
                                    <ListChecks className="w-5 h-5 text-teal-700" />
                                    সেমিস্টার/ব্যাচ ভিত্তিক বিষয় নির্ধারণ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {currentDept?.batches?.map((batch: any) => (
                                        <button
                                            key={batch.id}
                                            onClick={() => setSelectedBatch(batch.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-bengali transition-all ${selectedBatch === batch.id
                                                ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-600/20"
                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                }`}
                                        >
                                            {batch.name}
                                        </button>
                                    ))}
                                    {(!currentDept?.batches || currentDept.batches.length === 0) && (
                                        <div className="text-sm text-zinc-400 font-bengali italic">এই বিভাগে কোনো ব্যাচ বা সেমিস্টার নেই।</div>
                                    )}
                                </div>

                                {selectedBatch && (
                                    <div className="space-y-6">
                                        {/* Active Subjects for this Batch */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-bold text-teal-800 dark:text-teal-400 font-bengali">
                                                    {currentBatch?.name}-এ সক্রিয় বিষয়সমূহ:
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="font-bengali border-teal-200 text-teal-700 bg-teal-50">
                                                        {currentBatch?.batchSubjects?.length || 0} টি নির্বাচিত
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs font-bengali text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                                        onClick={() => {
                                                            setEditingSubject(null);
                                                            setNewSubjectName("");
                                                            setIsSubjectDialogOpen(true);
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> বিষয় যোগ করুন
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {currentDept?.subjects?.filter((sub: any) =>
                                                    currentBatch?.batchSubjects?.some((bs: any) => bs.subjectId === sub.id)
                                                ).map((sub: any) => (
                                                    <div
                                                        key={sub.id}
                                                        className="flex items-center gap-2 pl-4 pr-2 py-1.5 bg-teal-600 text-white rounded-full shadow-sm animate-in zoom-in-50 duration-200 group"
                                                    >
                                                        <span
                                                            className="font-bengali text-sm font-bold cursor-pointer hover:underline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingSubject({ id: sub.id, name: sub.name });
                                                                setNewSubjectName(sub.name);
                                                                setIsSubjectDialogOpen(true);
                                                            }}
                                                        >
                                                            {sub.name}
                                                        </span>
                                                        <div className="flex items-center gap-1 border-l border-white/20 pl-1 ml-1">
                                                            <button
                                                                onClick={() => handleToggleBatchSubject(sub.id, false)}
                                                                className="hover:bg-white/10 rounded-full p-1 transition-colors"
                                                                title="বাদ দিন"
                                                            >
                                                                <Plus className="w-3.5 h-3.5 rotate-45" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubject(sub.id)}
                                                                className="hover:bg-red-500/30 rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                                                                title="মুছে ফেলুন"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!currentBatch?.batchSubjects || currentBatch.batchSubjects.length === 0) && (
                                                    <div className="text-zinc-400 italic font-bengali text-sm py-2">এখনো কোনো বিষয় যুক্ত করা হয়নি।</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Available Subjects Pool */}
                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                            <h4 className="font-bold text-zinc-500 mb-4 font-bengali text-sm uppercase tracking-wider">
                                                বিভাগীয় অন্যান্য বিষয়সমূহ (যুক্ত করতে ক্লিক করুন):
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {currentDept?.subjects?.filter((sub: any) =>
                                                    !currentBatch?.batchSubjects?.some((bs: any) => bs.subjectId === sub.id)
                                                ).map((sub: any) => (
                                                    <div
                                                        key={sub.id}
                                                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
                                                    >
                                                        <div
                                                            className="flex items-center gap-3 flex-1 cursor-pointer"
                                                            onClick={() => handleToggleBatchSubject(sub.id, true)}
                                                        >
                                                            <div className="w-5 h-5 rounded flex items-center justify-center border border-zinc-300 group-hover:border-teal-500 transition-colors">
                                                                <Plus className="w-3 h-3 text-zinc-400 group-hover:text-teal-600" />
                                                            </div>
                                                            <span className="font-bengali text-sm text-zinc-600 group-hover:text-zinc-900 group-hover:font-medium">
                                                                {sub.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                                onClick={() => {
                                                                    setEditingSubject({ id: sub.id, name: sub.name });
                                                                    setNewSubjectName(sub.name);
                                                                    setIsSubjectDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDeleteSubject(sub.id)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {currentDept?.subjects?.filter((sub: any) =>
                                                    !currentBatch?.batchSubjects?.some((bs: any) => bs.subjectId === sub.id)
                                                ).length === 0 && (
                                                        <div className="col-span-full py-4 text-center text-zinc-400 font-bengali italic text-sm">
                                                            আর কোনো বিষয় অবশিষ্ট নেই।
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Subject Dialog */}
            <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-bengali">
                            {editingSubject ? "বিষয় আপডেট করুন" : "নতুন বিষয় যোগ করুন"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bengali">বিষয়ের নাম</Label>
                            <Input
                                placeholder="যেমন: কুরআন, হাদিস, ফিকহ্"
                                value={newSubjectName}
                                onChange={e => setNewSubjectName(e.target.value)}
                                className="font-bengali"
                            />
                            <p className="text-[10px] text-zinc-500 font-bengali mt-1">
                                * একাধিক বিষয় থাকলে কমা ( , ) দিয়ে আলাদা করে লিখতে পারেন।
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsSubjectDialogOpen(false)}
                            className="font-bengali"
                        >
                            বাতিল
                        </Button>
                        <Button
                            onClick={handleSaveSubject}
                            disabled={processing}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bengali"
                        >
                            {processing ? "প্রসেসিং..." : "সংরক্ষণ করুন"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
