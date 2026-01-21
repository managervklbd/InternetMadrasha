"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, X, BookOpen, UserPlus, Users as UsersIcon } from "lucide-react";
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
import { TeacherAssignmentDialog } from "./TeacherAssignmentDialog";
import { Badge } from "@/components/ui/badge";

interface BatchItemProps {
    batch: {
        id: string;
        name: string;
        startDate?: any;
        endDate?: any;
        teachers?: any[];
        allowedMode?: string;
    };
    onEdit: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    onRefresh: () => void;
}

export function BatchItem({ batch, onEdit, onDelete, onRefresh }: BatchItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(batch.name);
    const [newStartDate, setNewStartDate] = useState(batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "");
    const [newEndDate, setNewEndDate] = useState(batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "");
    const [newMode, setNewMode] = useState(batch.allowedMode || "OFFLINE");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAssigningTeachers, setIsAssigningTeachers] = useState(false);

    const formatDate = (date: any) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleSave = () => {
        if (newName.trim() !== batch.name ||
            newStartDate !== (batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "") ||
            newEndDate !== (batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "") ||
            newMode !== batch.allowedMode
        ) {
            onEdit(batch.id, {
                name: newName,
                startDate: newStartDate ? new Date(newStartDate) : undefined,
                endDate: newEndDate ? new Date(newEndDate) : undefined,
                allowedMode: newMode
            } as any);
        }
        setIsEditing(false);
    };

    return (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-white dark:hover:bg-zinc-800/50 group transition-colors">
            <div className="flex items-center gap-2 flex-1">
                <BookOpen className="w-3.5 h-3.5 text-zinc-300" />

                {isEditing ? (
                    <div className="flex flex-col gap-2 p-1 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-8 w-full font-bengali text-sm"
                            placeholder="নাম..."
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-400 block ml-1">শুরু</label>
                                <Input
                                    type="date"
                                    value={newStartDate}
                                    onChange={(e) => setNewStartDate(e.target.value)}
                                    className="h-7 text-[10px] font-bengali"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-400 block ml-1">শেষ</label>
                                <Input
                                    type="date"
                                    value={newEndDate}
                                    onChange={(e) => setNewEndDate(e.target.value)}
                                    className="h-7 text-[10px] font-bengali"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 px-1">
                            <label className="text-[9px] uppercase font-bold text-zinc-400 block ml-1">মোড (Mode)</label>
                            <div className="flex items-center gap-4 ml-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`editMode_${batch.id}`}
                                        id={`edit_offline_${batch.id}`}
                                        value="OFFLINE"
                                        checked={newMode === "OFFLINE"}
                                        onChange={() => setNewMode("OFFLINE")}
                                    />
                                    <label htmlFor={`edit_offline_${batch.id}`} className="font-bengali text-[10px] cursor-pointer">অফলাইন</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`editMode_${batch.id}`}
                                        id={`edit_online_${batch.id}`}
                                        value="ONLINE"
                                        checked={newMode === "ONLINE"}
                                        onChange={() => setNewMode("ONLINE")}
                                    />
                                    <label htmlFor={`edit_online_${batch.id}`} className="font-bengali text-[10px] cursor-pointer">অনলাইন</label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-1 mt-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSave}>
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-500" onClick={() => setIsEditing(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bengali text-sm text-zinc-600 dark:text-zinc-100 font-medium">
                                {batch.name}
                            </span>
                            <Badge variant="outline" className={cn(
                                "h-4 text-[9px] px-1.5 font-bengali",
                                batch.allowedMode === "ONLINE"
                                    ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                    : "bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                            )}>
                                {batch.allowedMode === "ONLINE" ? "অনলাইন" : "অফলাইন"}
                            </Badge>
                        </div>
                        {batch.teachers && batch.teachers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {batch.teachers.map((t: any) => (
                                    <Badge key={t.id} variant="secondary" className="h-4.5 text-[9px] px-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-800 font-bengali gap-1">
                                        <UsersIcon className="w-2.5 h-2.5" />
                                        {t.fullName}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {(batch.startDate || batch.endDate) && (
                            <span className="text-[10px] text-zinc-400 font-bengali mt-0.5">
                                {batch.startDate && formatDate(batch.startDate)}
                                {batch.startDate && batch.endDate && " - "}
                                {batch.endDate && formatDate(batch.endDate)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {!isEditing && (
                <div className="flex items-center gap-1 opacity-40 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-teal-600"
                        title="শিক্ষক নির্ধারণ করুন"
                        onClick={() => setIsAssigningTeachers(true)}
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-blue-600"
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit className="w-3 h-3" />
                    </Button>

                    <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-zinc-950">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-bengali">সেমিস্টার মুছে ফেলুন?</AlertDialogTitle>
                                <AlertDialogDescription className="font-bengali">
                                    আপনি কি নিশ্চিত? এটি ফিরিয়ে আনা অসম্ভব।
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 font-bengali"
                                    onClick={() => onDelete(batch.id)}
                                >
                                    মুছে ফেলুন
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            <TeacherAssignmentDialog
                open={isAssigningTeachers}
                onOpenChange={setIsAssigningTeachers}
                batchId={batch.id}
                batchName={batch.name}
                currentTeacherIds={batch.teachers?.map(t => t.id) || []}
                onSuccess={onRefresh}
            />
        </div>
    );
}
