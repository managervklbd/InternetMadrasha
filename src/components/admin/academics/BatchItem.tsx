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
    };
    onEdit: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
}

export function BatchItem({ batch, onEdit, onDelete }: BatchItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(batch.name);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = () => {
        if (newName.trim() !== batch.name) {
            onEdit(batch.id, newName);
        }
        setIsEditing(false);
    };

    return (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-white dark:hover:bg-zinc-800/50 group transition-colors">
            <div className="flex items-center gap-2 flex-1">
                <BookOpen className="w-3.5 h-3.5 text-zinc-300" />

                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-7 w-40 font-bengali text-sm"
                            autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSave}>
                            <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-500" onClick={() => setIsEditing(false)}>
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                ) : (
                    <span className="font-bengali text-sm text-zinc-600 dark:text-zinc-300">
                        {batch.name}
                    </span>
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
