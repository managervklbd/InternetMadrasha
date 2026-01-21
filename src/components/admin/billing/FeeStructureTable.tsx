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
    const [changes, setChanges] = useState<Record<string, { monthlyFee?: string, sadkaFee?: string }>>({});

    const refreshStructure = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await getAcademicStructure();
            setStructure(data);
            // Don't reset expanded state on refresh
            if (Object.keys(expanded).length === 0) {
                const initialExpanded: Record<string, boolean> = {};
                data.forEach((course: any) => {
                    initialExpanded[course.id] = true;
                    course.departments.forEach((dept: any) => {
                        initialExpanded[dept.id] = true;
                    });
                });
                setExpanded(initialExpanded);
            }
        } catch (err) {
            console.error(err);
            toast.error("স্ট্রাকচার লোড করতে ব্যর্থ হয়েছে");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        refreshStructure();
    }, []);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFieldChange = (id: string, field: 'monthlyFee' | 'sadkaFee', value: string) => {
        setChanges(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value
            }
        }));
    };

    const handleSave = async (id: string, type: 'COURSE' | 'DEPT' | 'BATCH', name: string, originalMonthly: any, originalSadka: any) => {
        setSaving(id);

        // Use changed value if it exists, otherwise use original
        const mValue = changes[id]?.monthlyFee !== undefined ? changes[id].monthlyFee : originalMonthly;
        const sValue = changes[id]?.sadkaFee !== undefined ? changes[id].sadkaFee : originalSadka;

        const mFee = mValue !== null && mValue !== undefined && mValue !== "" ? parseFloat(mValue) : undefined;
        const sFee = sValue !== null && sValue !== undefined && sValue !== "" ? parseFloat(sValue) : undefined;

        try {
            let res;
            if (type === 'COURSE') {
                res = await updateCourse(id, { name, monthlyFee: mFee, sadkaFee: sFee });
            } else if (type === 'DEPT') {
                res = await updateDepartment(id, { name, monthlyFee: mFee, sadkaFee: sFee });
            } else {
                res = await updateBatch(id, { name, monthlyFee: mFee, sadkaFee: sFee });
            }

            if (res.success) {
                toast.success("ফি আপডেট সফল হয়েছে");
                // Clear changes for this ID
                setChanges(prev => {
                    const newChanges = { ...prev };
                    delete newChanges[id];
                    return newChanges;
                });
                // Refresh data silently
                await refreshStructure(true);
            } else {
                toast.error(res.error || "আপডেট ব্যর্থ হয়েছে");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setSaving(null);
        }
    };

    if (loading && structure.length === 0) return <div className="text-center py-20 bg-white rounded-lg border">লোড হচ্ছে...</div>;

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
                        const hasCourseChanges = changes[course.id] !== undefined;

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
                                            id={course.id}
                                            field="monthlyFee"
                                            value={course.monthlyFee}
                                            changedValue={changes[course.id]?.monthlyFee}
                                            placeholder="কোর্স ডিফল্ট"
                                            onChange={handleFieldChange}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FeeInput
                                            id={course.id}
                                            field="sadkaFee"
                                            value={course.sadkaFee}
                                            changedValue={changes[course.id]?.sadkaFee}
                                            placeholder="কোর্স ডিফল্ট"
                                            onChange={handleFieldChange}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <RowAction
                                            id={course.id}
                                            savingId={saving}
                                            hasChanges={hasCourseChanges}
                                            onSave={() => handleSave(course.id, 'COURSE', course.name, course.monthlyFee, course.sadkaFee)}
                                        />
                                    </TableCell>
                                </TableRow>

                                {/* Departments */}
                                {isExpanded && course.departments.map((dept: any) => {
                                    const isDeptExpanded = expanded[dept.id];
                                    const hasDeptChanges = changes[dept.id] !== undefined;

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
                                                        id={dept.id}
                                                        field="monthlyFee"
                                                        value={dept.monthlyFee}
                                                        changedValue={changes[dept.id]?.monthlyFee}
                                                        placeholder={course.monthlyFee || "0"}
                                                        onChange={handleFieldChange}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FeeInput
                                                        id={dept.id}
                                                        field="sadkaFee"
                                                        value={dept.sadkaFee}
                                                        changedValue={changes[dept.id]?.sadkaFee}
                                                        placeholder={course.sadkaFee || "0"}
                                                        onChange={handleFieldChange}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <RowAction
                                                        id={dept.id}
                                                        savingId={saving}
                                                        hasChanges={hasDeptChanges}
                                                        onSave={() => handleSave(dept.id, 'DEPT', dept.name, dept.monthlyFee, dept.sadkaFee)}
                                                    />
                                                </TableCell>
                                            </TableRow>

                                            {/* Batches */}
                                            {isDeptExpanded && dept.batches.map((batch: any) => {
                                                const hasBatchChanges = changes[batch.id] !== undefined;
                                                return (
                                                    <TableRow key={batch.id} className="hover:bg-zinc-50">
                                                        <TableCell className="font-bengali pl-20 flex items-center gap-2">
                                                            <div className="w-3 h-3 border-l border-b border-zinc-300 -mt-2 mr-1"></div>
                                                            <span>{batch.name}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <FeeInput
                                                                id={batch.id}
                                                                field="monthlyFee"
                                                                value={batch.monthlyFee}
                                                                changedValue={changes[batch.id]?.monthlyFee}
                                                                placeholder={dept.monthlyFee || course.monthlyFee || "0"}
                                                                onChange={handleFieldChange}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FeeInput
                                                                id={batch.id}
                                                                field="sadkaFee"
                                                                value={batch.sadkaFee}
                                                                changedValue={changes[batch.id]?.sadkaFee}
                                                                placeholder={dept.sadkaFee || course.sadkaFee || "0"}
                                                                onChange={handleFieldChange}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <RowAction
                                                                id={batch.id}
                                                                savingId={saving}
                                                                hasChanges={hasBatchChanges}
                                                                onSave={() => handleSave(batch.id, 'BATCH', batch.name, batch.monthlyFee, batch.sadkaFee)}
                                                            />
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

// Sub-components moved outside to prevent focus loss during re-renders
function FeeInput({ id, field, value, changedValue, placeholder, onChange }: any) {
    const displayValue = changedValue !== undefined ? changedValue : (value ?? "");

    return (
        <Input
            type="number"
            className={`h-8 w-24 font-bengali bg-white dark:bg-zinc-900 ${changedValue !== undefined ? 'border-orange-400 ring-1 ring-orange-200' : ''}`}
            placeholder={placeholder}
            value={displayValue}
            onChange={(e) => onChange(id, field, e.target.value)}
        />
    );
}

function RowAction({ id, savingId, onSave, hasChanges }: any) {
    const isSaving = savingId === id;

    return (
        <Button
            size="sm"
            variant={hasChanges ? "default" : "ghost"}
            onClick={onSave}
            disabled={savingId !== null}
            className={`h-8 w-8 p-0 ${hasChanges ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'}`}
        >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </Button>
    );
}
