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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    getAcademicStructure,
    updateCourse,
    updateDepartment,
    updateBatch
} from "@/lib/actions/academic-actions";
import { getFeeHeads, createFeeHead, updateAcademicFee, deleteFeeHead } from "@/lib/actions/fee-structure-actions";
import { Loader2, Save, ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";

interface FeeHead {
    id: string;
    name: string;
    active: boolean;
}

export function FeeStructureTable({ viewMode = "ONLINE" }: { viewMode?: string }) {
    const [structure, setStructure] = useState<any[]>([]);
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Changes state: Record<EntityId, Record<FieldOrFeeHeadId, Value>>
    const [changes, setChanges] = useState<Record<string, Record<string, string>>>({});

    // New Fee Head Dialog State
    const [isAddHeadOpen, setIsAddHeadOpen] = useState(false);
    const [newHeadName, setNewHeadName] = useState("");
    const [isCreatingHead, setIsCreatingHead] = useState(false);

    const refreshStructure = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [data, heads] = await Promise.all([
                getAcademicStructure(),
                getFeeHeads()
            ]);

            setStructure(data);
            setFeeHeads(heads as FeeHead[]);

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

    const handleFieldChange = (id: string, field: string, value: string) => {
        setChanges(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value
            }
        }));
    };

    const handleCreateFeeHead = async () => {
        if (!newHeadName) return;
        setIsCreatingHead(true);
        try {
            const res = await createFeeHead(newHeadName);
            if (res.success) {
                toast.success("নতুন ফি খাত তৈরি হয়েছে");
                setNewHeadName("");
                setIsAddHeadOpen(false);
                refreshStructure(true);
            } else {
                toast.error(res.error || "ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        } finally {
            setIsCreatingHead(false);
        }
    };

    const handleDeleteFeeHead = async (id: string) => { // Added delete function
        if (!confirm("আপনি কি নিশ্চিত যে আপনি এই ফি খাতটি মুছে ফেলতে চান?")) return;
        try {
            const res = await deleteFeeHead(id);
            if (res.success) {
                toast.success("ফি খাত মুছে ফেলা হয়েছে");
                refreshStructure(true);
            } else {
                toast.error(res.error || "ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("ত্রুটি হয়েছে");
        }
    }


    const handleSave = async (id: string, type: 'COURSE' | 'DEPARTMENT' | 'BATCH', name: string, originalData: any) => {
        setSaving(id);
        const entityChanges = changes[id] || {};

        // 1. Separate fixed fields and dynamic fees
        const fixedFields = ['monthlyFee', 'admissionFee', 'sadkaFee', 'examFee', 'registrationFee', 'otherFee',
            'monthlyFeeOffline', 'admissionFeeOffline', 'sadkaFeeOffline', 'examFeeOffline', 'registrationFeeOffline', 'otherFeeOffline'];

        const fixedPayload: any = {};
        const dynamicUpdates: { feeHeadId: string, amount: number }[] = [];

        Object.entries(entityChanges).forEach(([key, value]) => {
            const numValue = (value !== null && value !== undefined && value !== "") ? parseFloat(value) : undefined;

            if (fixedFields.includes(key)) {
                fixedPayload[key] = numValue;
            } else {
                // Assume it's a feeHeadId
                if (numValue !== undefined) {
                    dynamicUpdates.push({ feeHeadId: key, amount: numValue });
                }
            }
        });

        try {
            // Save fixed fields if any
            if (Object.keys(fixedPayload).length > 0) {
                // Server actions require 'name'
                fixedPayload.name = name;

                let res;
                // Merge with original data to ensure we don't accidentally undefined stuff if the API expects full object (though update usually accepts partial)
                // Actually my update actions accept partials, so simply passing what's in payload is fine?
                // Wait, the update actions accept a data object with optional fields.
                // However, I need to make sure I don't send undefined for fields that weren't changed if I'm not supposed to.
                // My helper above `getVal` in previous code handled this by defaulting to original.
                // In this new logic, I only add to `fixedPayload` if it represents a CHANGE.
                // But the update actions might need me to be careful.
                // Looking at `updateCourse`: it takes `data` object. If I pass `{ monthlyFee: undefined }`, Prisma update ignores it usually if explicitly undefined? 
                // No, prisma update ignores undefined.

                // Let's rely on the action to handle it.

                if (type === 'COURSE') res = await updateCourse(id, fixedPayload);
                else if (type === 'DEPARTMENT') res = await updateDepartment(id, fixedPayload);
                else res = await updateBatch(id, fixedPayload as any); // Type assertion needed due to slightly diff definitions

                if (!res.success) throw new Error(res.error);
            }

            // Save dynamic fees
            for (const update of dynamicUpdates) {
                await updateAcademicFee(id, type, update.feeHeadId, update.amount);
            }

            toast.success("আপডেট সফল হয়েছে");
            setChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[id];
                return newChanges;
            });
            await refreshStructure(true);

        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "ত্রুটি হয়েছে");
        } finally {
            setSaving(null);
        }
    };

    if (loading && structure.length === 0) return <div className="text-center py-20 bg-white rounded-lg border">লোড হচ্ছে...</div>;

    const isOnline = viewMode !== "OFFLINE";
    const isOffline = viewMode === "OFFLINE";

    // Helper to get dynamic fee value from entity
    const getDynamicFee = (entity: any, feeHeadId: string) => {
        const fee = entity.academicFees?.find((f: any) => f.feeHeadId === feeHeadId);
        return fee ? fee.amount : undefined;
    };

    return (
        <div className="rounded-md border bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
            <div className="p-2 border-b flex justify-end bg-white dark:bg-zinc-950">
                <Dialog open={isAddHeadOpen} onOpenChange={setIsAddHeadOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 gap-1 font-bengali">
                            <Plus className="w-4 h-4" />
                            ম্যানেজ ফি খাত
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>ফি খাত ম্যানেজমেন্ট</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label>নতুন ফি খাত যোগ করুন</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newHeadName}
                                        onChange={e => setNewHeadName(e.target.value)}
                                        placeholder="ফি এর নাম (উদাহরণ: পরিবহন)"
                                        className="font-bengali"
                                    />
                                    <Button onClick={handleCreateFeeHead} disabled={isCreatingHead || !newHeadName}>
                                        {isCreatingHead ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>বর্তমান ফি খাত সমূহ</Label>
                                <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
                                    {feeHeads.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-zinc-500">কোনো ফি খাত নেই</div>
                                    ) : (
                                        feeHeads.map(head => (
                                            <div key={head.id} className="flex items-center justify-between p-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                <span className="font-bengali text-sm">{head.name}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteFeeHead(head.id)}
                                                    title="মুছে ফেলুন"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-100">
                            <TableHead className="w-[200px] bg-zinc-100 dark:bg-zinc-800 sticky left-0 z-10 font-bengali h-9">একাডেমিক নাম</TableHead>

                            {/* Fixed Columns */}
                            {isOnline && <TableHead className="w-[80px] font-bengali text-center border-r h-9 px-1">মাসিক</TableHead>}
                            {isOnline && <TableHead className="w-[80px] font-bengali text-center border-r h-9 px-1">ভর্তি</TableHead>}
                            {isOnline && <TableHead className="w-[80px] font-bengali text-center border-r h-9 px-1">সদকা</TableHead>}

                            {isOffline && <TableHead className="w-[80px] font-bengali text-center border-r bg-orange-50/50 h-9 px-1">মাসিক</TableHead>}
                            {isOffline && <TableHead className="w-[80px] font-bengali text-center border-r bg-orange-50/50 h-9 px-1">ভর্তি</TableHead>}

                            {/* Dynamic Columns */}
                            {feeHeads.map(head => (
                                <TableHead key={head.id} className="w-[80px] font-bengali text-center border-r relative group h-9 px-1">
                                    {head.name}
                                </TableHead>
                            ))}

                            {/* Other Fixed Columns */}
                            {isOnline && <TableHead className="w-[80px] font-bengali text-center border-r h-9 px-1">পরিক্ষা</TableHead>}
                            {/* {isOnline && <TableHead className="w-[80px] font-bengali text-center border-r">রেজিঃ</TableHead>} */}
                            {/* {isOnline && <TableHead className="w-[80px] font-bengali text-center border-r">অন্যান্য</TableHead>} */}

                            <TableHead className="w-[50px] bg-zinc-100 dark:bg-zinc-800 sticky right-0 z-10 h-9"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {structure.map((course) => {
                            const isExpanded = expanded[course.id];
                            const hasChanges = changes[course.id] !== undefined;

                            return (
                                <Fragment key={course.id}>
                                    {/* Course Row */}
                                    <TableRow className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 border-b-0">
                                        <TableCell className="font-medium font-bengali flex items-center gap-2 sticky left-0 bg-white dark:bg-zinc-950 z-10 py-1">
                                            <button onClick={() => toggleExpand(course.id)} className="p-0.5 hover:bg-zinc-100 rounded">
                                                {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                                            </button>
                                            <span className="text-sm text-teal-700 whitespace-nowrap">{course.name}</span>
                                        </TableCell>

                                        {renderFeeCells({
                                            id: course.id,
                                            data: course,
                                            feeHeads,
                                            isOnline,
                                            isOffline,
                                            changes: changes[course.id],
                                            onChange: handleFieldChange
                                        })}

                                        <TableCell className="sticky right-0 bg-white dark:bg-zinc-950 z-10 shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)] py-1">
                                            <RowAction
                                                id={course.id}
                                                savingId={saving}
                                                hasChanges={hasChanges}
                                                onSave={() => handleSave(course.id, 'COURSE', course.name, course)}
                                            />
                                        </TableCell>
                                    </TableRow>

                                    {/* Departments */}
                                    {isExpanded && course.departments.map((dept: any) => {
                                        const isDeptExpanded = expanded[dept.id];
                                        const hasDeptChanges = changes[dept.id] !== undefined;

                                        return (
                                            <Fragment key={dept.id}>
                                                <TableRow className="bg-zinc-50/50 hover:bg-zinc-100 border-b-0">
                                                    <TableCell className="font-bengali pl-8 flex items-center gap-2 sticky left-0 bg-zinc-50/50 z-10 py-1">
                                                        <button onClick={() => toggleExpand(dept.id)} className="p-0.5 hover:bg-zinc-200 rounded">
                                                            {isDeptExpanded ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronRight className="w-3 h-3 text-zinc-400" />}
                                                        </button>
                                                        <span className="whitespace-nowrap text-sm">{dept.name}</span>
                                                    </TableCell>

                                                    {renderFeeCells({
                                                        id: dept.id,
                                                        data: dept,
                                                        feeHeads,
                                                        isOnline,
                                                        isOffline,
                                                        changes: changes[dept.id],
                                                        onChange: handleFieldChange,
                                                        inheritFrom: course
                                                    })}

                                                    <TableCell className="sticky right-0 bg-zinc-50/50 z-10 py-1">
                                                        <RowAction
                                                            id={dept.id}
                                                            savingId={saving}
                                                            hasChanges={hasDeptChanges}
                                                            onSave={() => handleSave(dept.id, 'DEPARTMENT', dept.name, dept)}
                                                        />
                                                    </TableCell>
                                                </TableRow>

                                                {/* Batches */}
                                                {isDeptExpanded && dept.batches.map((batch: any) => {
                                                    const hasBatchChanges = changes[batch.id] !== undefined;
                                                    return (
                                                        <TableRow key={batch.id} className="hover:bg-zinc-50 border-b-0">
                                                            <TableCell className="font-bengali pl-16 flex items-center gap-2 sticky left-0 bg-white/50 backdrop-blur-sm z-10 py-1">
                                                                <div className="w-3 h-3 border-l border-b border-zinc-300 -mt-2 mr-1"></div>
                                                                <span className="whitespace-nowrap text-sm">{batch.name}</span>
                                                            </TableCell>

                                                            {renderFeeCells({
                                                                id: batch.id,
                                                                data: batch,
                                                                feeHeads,
                                                                isOnline,
                                                                isOffline,
                                                                changes: changes[batch.id],
                                                                onChange: handleFieldChange,
                                                                inheritFrom: dept, // Batches inherit from Dept (which inherits from Course)
                                                                inheritRoot: course
                                                            })}

                                                            <TableCell className="sticky right-0 bg-white/50 backdrop-blur-sm z-10 py-1">
                                                                <RowAction
                                                                    id={batch.id}
                                                                    savingId={saving}
                                                                    hasChanges={hasBatchChanges}
                                                                    onSave={() => handleSave(batch.id, 'BATCH', batch.name, batch)}
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
        </div>
    );
}

// Fixed Render Function for Consistency
function renderFeeCells({ id, data, feeHeads, isOnline, isOffline, changes, onChange, inheritFrom, inheritRoot }: any) {
    const getVal = (field: string) => changes?.[field];
    const getPlaceholder = (field: string) => {
        let val = data[field];
        if (val === null || val === undefined) val = inheritFrom?.[field];
        if ((val === null || val === undefined) && inheritRoot) val = inheritRoot[field];
        return val ?? "0";
    };

    const getDynamicPlaceholder = (feeHeadId: string) => {
        let val = data.academicFees?.find((f: any) => f.feeHeadId === feeHeadId)?.amount;
        if (val === undefined) val = inheritFrom?.academicFees?.find((f: any) => f.feeHeadId === feeHeadId)?.amount;
        if (val === undefined && inheritRoot) val = inheritRoot.academicFees?.find((f: any) => f.feeHeadId === feeHeadId)?.amount;
        return val ?? "0";
    };

    return (
        <>
            {/* Fixed Columns */}
            {isOnline && (
                <>
                    <TableCell className="border-r p-0.5"><FeeInput id={id} field="monthlyFee" value={data.monthlyFee} changedValue={getVal('monthlyFee')} placeholder={getPlaceholder('monthlyFee')} onChange={onChange} /></TableCell>
                    <TableCell className="border-r p-0.5"><FeeInput id={id} field="admissionFee" value={data.admissionFee} changedValue={getVal('admissionFee')} placeholder={getPlaceholder('admissionFee')} onChange={onChange} /></TableCell>
                    <TableCell className="border-r p-0.5"><FeeInput id={id} field="sadkaFee" value={data.sadkaFee} changedValue={getVal('sadkaFee')} placeholder={getPlaceholder('sadkaFee')} onChange={onChange} /></TableCell>
                </>
            )}
            {isOffline && (
                <>
                    <TableCell className="border-r p-0.5 bg-orange-50/30"><FeeInput id={id} field="monthlyFeeOffline" value={data.monthlyFeeOffline} changedValue={getVal('monthlyFeeOffline')} placeholder={getPlaceholder('monthlyFeeOffline')} onChange={onChange} /></TableCell>
                    <TableCell className="border-r p-0.5 bg-orange-50/30"><FeeInput id={id} field="admissionFeeOffline" value={data.admissionFeeOffline} changedValue={getVal('admissionFeeOffline')} placeholder={getPlaceholder('admissionFeeOffline')} onChange={onChange} /></TableCell>
                </>
            )}

            {/* Dynamic Columns */}
            {feeHeads.map((head: any) => {
                const existingFee = data.academicFees?.find((f: any) => f.feeHeadId === head.id)?.amount;
                return (
                    <TableCell key={head.id} className="border-r p-0.5">
                        <FeeInput
                            id={id}
                            field={head.id}
                            value={existingFee}
                            changedValue={getVal(head.id)}
                            placeholder={getDynamicPlaceholder(head.id)}
                            onChange={onChange}
                        />
                    </TableCell>
                );
            })}

            {/* Other Fixed Columns */}
            {isOnline && (
                <>
                    <TableCell className="border-r p-0.5"><FeeInput id={id} field="examFee" value={data.examFee} changedValue={getVal('examFee')} placeholder={getPlaceholder('examFee')} onChange={onChange} /></TableCell>
                    {/* <TableCell className="border-r p-1"><FeeInput id={id} field="registrationFee" value={data.registrationFee} changedValue={getVal('registrationFee')} placeholder={getPlaceholder('registrationFee')} onChange={onChange} /></TableCell> */}
                    {/* <TableCell className="border-r p-1"><FeeInput id={id} field="otherFee" value={data.otherFee} changedValue={getVal('otherFee')} placeholder={getPlaceholder('otherFee')} onChange={onChange} /></TableCell> */}
                </>
            )}
        </>
    );
}

function FeeInput({ id, field, value, changedValue, placeholder, onChange }: any) {
    const displayValue = changedValue !== undefined ? changedValue : (value ?? "");

    return (
        <Input
            type="number"
            className={`h-7 w-full min-w-[60px] font-bengali bg-transparent text-center px-1 text-sm ${changedValue !== undefined ? 'border-orange-400 ring-1 ring-orange-200' : 'border-transparent hover:border-zinc-200'}`}
            placeholder={placeholder?.toString()}
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
            className={`h-7 w-7 p-0 ${hasChanges ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        </Button>
    );
}
