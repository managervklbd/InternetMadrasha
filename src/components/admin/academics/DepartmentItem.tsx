"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, X, ChevronRight, ChevronDown, Plus, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
import { createBatch, updateBatch, deleteBatch } from "@/lib/actions/academic-actions";
import { toast } from "sonner";
import { BatchItem } from "./BatchItem";

interface DepartmentItemProps {
    department: {
        id: string;
        name: string;
        batches: any[];
    };
    onEdit: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
    onRefresh: () => void;
}

export function DepartmentItem({ department, onEdit, onDelete, onRefresh }: DepartmentItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Dept Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(department.name);
    const [isDeleting, setIsDeleting] = useState(false);

    // Batch Creation State
    const [isAddingBatch, setIsAddingBatch] = useState(false);
    const [newBatchName, setNewBatchName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        if (newName.trim() !== department.name) {
            onEdit(department.id, newName);
        }
        setIsEditing(false);
    };

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBatchName.trim()) return;

        setLoading(true);
        try {
            const res = await createBatch({
                name: newBatchName,
                departmentId: department.id,
                type: "SEMESTER",
                allowedGender: "MALE", // Default, can be updated later if needed
                allowedMode: "OFFLINE"
            }) as any;

            if (res.success) {
                toast.success("সেমিস্টার তৈরি সফল হয়েছে");
                setNewBatchName("");
                setIsAddingBatch(false);
                onRefresh();
            } else {
                toast.error("সেমিস্টার তৈরি করতে ব্যর্থ");
            }
        } catch (e) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    const handleEditBatch = async (id: string, name: string) => {
        const res = await updateBatch(id, name) as any;
        if (res.success) {
            toast.success("আপডেট হয়েছে");
            onRefresh();
        } else {
            toast.error("ব্যর্থ হয়েছে");
        }
    };

    const handleDeleteBatch = async (id: string) => {
        const res = await deleteBatch(id) as any;
        if (res.success) {
            toast.success("মুছে ফেলা হয়েছে");
            onRefresh();
        } else {
            toast.error("ব্যর্থ হয়েছে");
        }
    };


    return (
        <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden">
            <div className={cn(
                "flex items-center justify-between p-3 transition-colors",
                isDeleting && "bg-red-50 dark:bg-red-900/10",
                isOpen && "bg-zinc-100 dark:bg-zinc-900"
            )}>
                <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => !isEditing && setIsOpen(!isOpen)}>
                    {isEditing ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-8 w-48 font-bengali"
                                autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave}>
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-500" onClick={() => setIsEditing(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                            <span className="font-bengali font-medium text-zinc-700 dark:text-zinc-200">
                                {department.name}
                            </span>
                            <Badge variant="secondary" className="text-xs font-normal bg-white dark:bg-zinc-800">
                                {department.batches.length || 0} সেমিস্টার
                            </Badge>
                        </>
                    )}
                </div>

                {!isEditing && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(true);
                                setIsAddingBatch(true);
                            }}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-blue-600"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>

                        <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-bengali">আপনি কি নিশ্চিত?</AlertDialogTitle>
                                    <AlertDialogDescription className="font-bengali">
                                        এই বিভাগটি মুছে ফেললে এর সাথে যুক্ত সকল সেমিস্টার হারিয়ে যাবে।
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 font-bengali"
                                        onClick={() => onDelete(department.id)}
                                    >
                                        মুছে ফেলুন
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="pl-9 pr-3 pb-3 pt-0">
                    <div className="pt-2 space-y-2 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4 mt-1">
                        {isAddingBatch && (
                            <form onSubmit={handleAddBatch} className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-top-1">
                                <BookOpen className="w-4 h-4 text-zinc-400" />
                                <Input
                                    className="h-8 w-48 font-bengali focus-visible:ring-teal-500"
                                    placeholder="সেমিস্টারের নাম..."
                                    value={newBatchName}
                                    onChange={(e) => setNewBatchName(e.target.value)}
                                    autoFocus
                                />
                                <Button type="submit" size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white font-bengali" disabled={loading}>
                                    যোগ
                                </Button>
                                <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingBatch(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </form>
                        )}

                        {department.batches && department.batches.length > 0 ? (
                            department.batches.map((batch: any) => (
                                <BatchItem
                                    key={batch.id}
                                    batch={batch}
                                    onEdit={handleEditBatch}
                                    onDelete={handleDeleteBatch}
                                />
                            ))
                        ) : (
                            !isAddingBatch && <p className="text-xs text-zinc-400 font-bengali italic">কোনো সেমিস্টার নেই</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
