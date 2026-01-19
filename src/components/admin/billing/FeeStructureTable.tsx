"use client";

import { useState, useEffect, Fragment } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    getAcademicStructure,
    updateCourse,
    updateDepartment,
    updateBatch
} from "@/lib/actions/academic-actions";
import { Loader2, Save, ChevronRight, ChevronDown } from "lucide-react";

export function FeeStructureTable() {
    const [structure, setStructure] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const refreshStructure = async () => {
        setLoading(true);
        try {
            const data = await getAcademicStructure();
            setStructure(data);
            // Default expand all
            const initialExpanded: Record<string, boolean> = {};
            data.forEach((course: any) => {
                initialExpanded[course.id] = true;
                course.departments.forEach((dept: any) => {
                    initialExpanded[dept.id] = true;
                });
            });
            setExpanded(initialExpanded);
        } catch (err) {
            console.error(err);
            toast.error("স্ট্রাকচার লোড করতে ব্যর্থ হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStructure();
    }, []);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = async (id: string, type: 'COURSE' | 'DEPT' | 'BATCH', name: string, monthlyFee: string, sadkaFee: string) => {
        setSaving(id);
        const mFee = monthlyFee ? parseFloat(monthlyFee) : undefined;
        const sFee = sadkaFee ? parseFloat(sadkaFee) : undefined;

        try {
            let res;
            if (type === 'COURSE') {
                res = await updateCourse(id, name, mFee, sFee);
            } else if (type === 'DEPT') {
                res = await updateDepartment(id, name, mFee, sFee);
            } else {
                res = await updateBatch(id, name, mFee, sFee);
            }

            if (res.success) {
                toast.success("ফি আপডেট সফল হয়েছে");
            } else {
                toast.error("আপডেট ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setSaving(null);
        }
    };

    const FeeInput = ({ value, onChange, placeholder }: { value: any, onChange: (val: string) => void, placeholder: string }) => (
        <Input
            type="number"
            className="h-8 w-24 font-bengali bg-white dark:bg-zinc-900"
            placeholder={placeholder}
            defaultValue={value}
            onBlur={(e) => onChange(e.target.value)}
        />
    );

    const RowAction = ({ onSave }: { onSave: () => void }) => (
        <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
            disabled={saving !== null}
            className="h-8 w-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
        >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </Button>
    );

    if (loading) return <div className="text-center py-20 bg-white rounded-lg border">লোড হচ্ছে...</div>;

    return (
        <div className="rounded-md border bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-100">
                        <TableHead className="w-[40%] font-bengali">একাডেমিক নাম</TableHead>
                        <TableHead className="w-[25%] font-bengali">রেগুলার ফি (টাকা)</TableHead>
                        <TableHead className="w-[25%] font-bengali">সাদকা ফি (টাকা)</TableHead>
                        <TableHead className="w-[10%]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {structure.map((course) => {
                        const isExpanded = expanded[course.id];
                        let courseMFee = course.monthlyFee;
                        let courseSFee = course.sadkaFee;

                        return (
                            <Fragment key={course.id}>
                                {/* Course Row */}
                                <TableRow key={course.id} className="bg-white dark:bg-zinc-950 hover:bg-zinc-50">
                                    <TableCell className="font-medium font-bengali flex items-center gap-2">
                                        <button onClick={() => toggleExpand(course.id)} className="p-1 hover:bg-zinc-100 rounded">
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                                        </button>
                                        <span className="text-base text-teal-700">{course.name}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border">কোর্স</span>
                                    </TableCell>
                                    <TableCell>
                                        <FeeInput
                                            value={course.monthlyFee}
                                            placeholder="কোর্স ডিফল্ট"
                                            onChange={(val) => courseMFee = val}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FeeInput
                                            value={course.sadkaFee}
                                            placeholder="কোর্স ডিফল্ট"
                                            onChange={(val) => courseSFee = val}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <RowAction onSave={() => handleSave(course.id, 'COURSE', course.name, courseMFee, courseSFee)} />
                                    </TableCell>
                                </TableRow>

                                {/* Departments */}
                                {isExpanded && course.departments.map((dept: any) => {
                                    const isDeptExpanded = expanded[dept.id];
                                    let deptMFee = dept.monthlyFee;
                                    let deptSFee = dept.sadkaFee;

                                    return (
                                        <Fragment key={dept.id}>
                                            <TableRow key={dept.id} className="bg-zinc-50/50 hover:bg-zinc-100">
                                                <TableCell className="font-bengali pl-10 flex items-center gap-2">
                                                    <button onClick={() => toggleExpand(dept.id)} className="p-1 hover:bg-zinc-200 rounded">
                                                        {isDeptExpanded ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronRight className="w-3 h-3 text-zinc-400" />}
                                                    </button>
                                                    <span>{dept.name}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600">বিভাগ</span>
                                                </TableCell>
                                                <TableCell>
                                                    <FeeInput
                                                        value={dept.monthlyFee}
                                                        placeholder={course.monthlyFee || "0"}
                                                        onChange={(val) => deptMFee = val}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FeeInput
                                                        value={dept.sadkaFee}
                                                        placeholder={course.sadkaFee || "0"}
                                                        onChange={(val) => deptSFee = val}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <RowAction onSave={() => handleSave(dept.id, 'DEPT', dept.name, deptMFee, deptSFee)} />
                                                </TableCell>
                                            </TableRow>

                                            {/* Batches */}
                                            {isDeptExpanded && dept.batches.map((batch: any) => {
                                                let batchMFee = batch.monthlyFee;
                                                let batchSFee = batch.sadkaFee;
                                                return (
                                                    <TableRow key={batch.id} className="hover:bg-zinc-50">
                                                        <TableCell className="font-bengali pl-20 flex items-center gap-2">
                                                            <div className="w-3 h-3 border-l border-b border-zinc-300 -mt-2 mr-1"></div>
                                                            <span>{batch.name}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <FeeInput
                                                                value={batch.monthlyFee}
                                                                placeholder={dept.monthlyFee || course.monthlyFee || "0"}
                                                                onChange={(val) => batchMFee = val}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FeeInput
                                                                value={batch.sadkaFee}
                                                                placeholder={dept.sadkaFee || course.sadkaFee || "0"}
                                                                onChange={(val) => batchSFee = val}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <RowAction onSave={() => handleSave(batch.id, 'BATCH', batch.name, batchMFee, batchSFee)} />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </Fragment>
                                    );
                                })}
                            </Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
