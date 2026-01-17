"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Plus,
    Save,
    AlertTriangle,
    FileSpreadsheet,
    GraduationCap
} from "lucide-react";
import { getAssignedBatches } from "@/lib/actions/teacher-portal-actions";
import { createAssessment } from "@/lib/actions/teacher-academic-actions";

export default function MarksPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Form State
    const [assessmentName, setAssessmentName] = useState("");
    const [totalMarks, setTotalMarks] = useState("100");

    useEffect(() => {
        const fetch = async () => {
            const b = await getAssignedBatches();
            setBatches(b);
            if (b.length > 0) setSelectedBatchId(b[0].id);
            setLoading(false);
        };
        fetch();
    }, []);

    const currentBatch = batches.find(b => b.id === selectedBatchId);
    const students = currentBatch?.enrollments?.map((e: any) => e.student) || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Grade Book</h1>
                    <p className="text-zinc-500 text-lg">Conduct assessments and record student marks. Results stay as DRAFT until Admin publishes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Setup Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Assessment Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Batch Context</Label>
                                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Evaluation Type</Label>
                                <Select onValueChange={setAssessmentName}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monthly Test">Monthly Test</SelectItem>
                                        <SelectItem value="Midterm Exam">Midterm Exam</SelectItem>
                                        <SelectItem value="Final Exam">Final Exam</SelectItem>
                                        <SelectItem value="Surprise Quiz">Surprise Quiz</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Total Marks</Label>
                                <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
                            </div>
                            <Button className="w-full bg-teal-600 hover:bg-teal-700 gap-2 h-11">
                                <Plus className="w-4 h-4" />
                                Initialize Sheet
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                        <p className="text-xs text-orange-700 leading-relaxed">
                            <strong>Safety Rule:</strong> Teachers can record marks but cannot modify them once results are published by the Admin. Always double-check before saving.
                        </p>
                    </div>
                </div>

                {/* Entry Grid */}
                <div className="lg:col-span-3">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 h-full">
                        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Marks Entry Sheet</CardTitle>
                                    <CardDescription>Enter obtained marks for each student below.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                        Import Excel
                                    </Button>
                                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2">
                                        <Save className="w-4 h-4" />
                                        Save as Draft
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Roll ID</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead className="w-[150px]">Marks ({totalMarks})</TableHead>
                                        <TableHead>Feedback / Note</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-zinc-500 italic">
                                                Select a batch to begin entry.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student: any) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-mono text-sm">{student.studentID}</TableCell>
                                                <TableCell>
                                                    <div className="font-semibold">{student.fullName}</div>
                                                    <div className="text-xs text-zinc-500 uppercase tracking-tighter">{student.mode} Mode</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" placeholder="00" className="h-9 w-24 text-center font-bold" />
                                                </TableCell>
                                                <TableCell>
                                                    <Input placeholder="Excellent effort..." className="h-9" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
