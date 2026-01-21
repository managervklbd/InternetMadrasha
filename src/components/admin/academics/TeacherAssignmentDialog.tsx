"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getTeachers } from "@/lib/actions/teacher-actions";
import { assignTeachersToBatch } from "@/lib/actions/academic-actions";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batchId: string;
    batchName: string;
    currentTeacherIds: string[];
    onSuccess: () => void;
}

export function TeacherAssignmentDialog({ open, onOpenChange, batchId, batchName, currentTeacherIds, onSuccess }: Props) {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getTeachers()
                .then(data => {
                    setTeachers(data);
                    setSelectedIds(currentTeacherIds);
                })
                .finally(() => setLoading(false));
        }
    }, [open, currentTeacherIds]);

    const handleToggle = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(i => i !== id));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await assignTeachersToBatch(batchId, selectedIds) as any;
            if (res.success) {
                toast.success("শিক্ষক প্যানেল আপডেট হয়েছে");
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(res.error || "আপডেট করতে ব্যর্থ");
            }
        } catch (err) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-bengali flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-600" />
                        শিক্ষক নির্ধারণ: {batchName}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <p className="text-sm text-zinc-500 font-bengali">
                        এই ব্যাচের জন্য শিক্ষক নির্বাচন করুন। নির্বাচিত শিক্ষকরা এই ব্যাচের হাজিরা এবং অন্যান্য তথ্য ম্যানেজ করতে পারবেন।
                    </p>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                            </div>
                        ) : teachers.length === 0 ? (
                            <p className="text-center py-8 text-zinc-400 font-bengali italic">কোনো শিক্ষক পাওয়া যায়নি</p>
                        ) : (
                            teachers.map((teacher) => (
                                <div key={teacher.id} className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                    <Checkbox
                                        id={`teacher-${teacher.id}`}
                                        checked={selectedIds.includes(teacher.id)}
                                        onCheckedChange={(checked) => handleToggle(teacher.id, checked === true)}
                                    />
                                    <label
                                        htmlFor={`teacher-${teacher.id}`}
                                        className="flex-1 text-sm font-medium font-bengali cursor-pointer"
                                    >
                                        {teacher.fullName}
                                        <span className="block text-[10px] text-zinc-400 font-normal">{teacher.designation}</span>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" className="font-bengali" onClick={() => onOpenChange(false)}>বাতিল</Button>
                    <Button
                        className="bg-teal-600 hover:bg-teal-700 font-bengali gap-2"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
