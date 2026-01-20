"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, X, BookOpen } from "lucide-react";
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

interface BatchItemProps {
    batch: {
        id: string;
        name: string;
        startDate?: any;
        endDate?: any;
    };
    onEdit: (id: string, data: any) => void;
    onDelete: (id: string) => void;
}

export function BatchItem({ batch, onEdit, onDelete }: BatchItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(batch.name);
    const [newStartDate, setNewStartDate] = useState(batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "");
    const [newEndDate, setNewEndDate] = useState(batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "");
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (date: any) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleSave = () => {
        if (newName.trim() !== batch.name ||
            newStartDate !== (batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "") ||
            newEndDate !== (batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "")
        ) {
            onEdit(batch.id, {
                name: newName,
                startDate: newStartDate ? new Date(newStartDate) : undefined,
                endDate: newEndDate ? new Date(newEndDate) : undefined
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
                        <span className="font-bengali text-sm text-zinc-600 dark:text-zinc-300">
                            {batch.name}
                        </span>
                        {(batch.startDate || batch.endDate) && (
                            <span className="text-[10px] text-zinc-400 font-bengali">
                                {batch.startDate && formatDate(batch.startDate)}
                                {batch.startDate && batch.endDate && " - "}
                                {batch.endDate && formatDate(batch.endDate)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {!isEditing && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <AlertDialogContent>
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
        </div>
    );
}
