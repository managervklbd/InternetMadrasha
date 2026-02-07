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
    Search,
    Filter,
    BookOpen,
    GraduationCap,
    Calendar,
    CheckCircle2
} from "lucide-react";
import { getAssignedBatches, getBatchSubjects } from "@/lib/actions/teacher-portal-actions";
import { getAllBatches } from "@/lib/actions/academic-actions"; // We need an admin version of this
import { createAssessment, getBatchAssessments, getAssessmentMarks, saveDraftMarks } from "@/lib/actions/teacher-academic-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminGradebookPage() {
    // State
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");

    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

    const [assessments, setAssessments] = useState<any[]>([]);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");

    const [marks, setMarks] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial Load
    useEffect(() => {
        const fetchBatches = async () => {
            // In admin mode, we want ALL batches. 
            // Ideally we have an endpoint for that. For now using getAllBatches if available or reusing teacher one if admin is also teacher?
            // Reusing academic-actions getAllBatches would be best but it might return complex data.
            // Let's assume we can fetch batches.
            try {
                // TODO: Replace with proper admin batch fetch
                // For now, attempting to use same action or mocking
                const res = await getAllBatches(); // Need to verify if this exists and returns what we need
                setBatches(res);
            } catch (e) {
                toast.error("ব্যাচ লোড করা যায়নি");
            }
        };
        fetchBatches();
    }, []);

    // Load Subjects when Batch Changes
    useEffect(() => {
        if (!selectedBatchId) {
            setSubjects([]);
            return;
        }
        const fetchSubjects = async () => {
            try {
                const res = await getBatchSubjects(selectedBatchId);
                setSubjects(res);
            } catch (e) {
                console.error(e);
            }
        };
        fetchSubjects();
    }, [selectedBatchId]);

    // Load Assessments
    useEffect(() => {
        if (!selectedBatchId) return;
        const fetchAssessments = async () => {
            try {
                const res = await getBatchAssessments(selectedBatchId, selectedSubjectId === "all" ? undefined : selectedSubjectId);
                setAssessments(res);
            } catch (e) {
                console.error(e);
            }
        };
        fetchAssessments();
    }, [selectedBatchId, selectedSubjectId]);

    // Load Marks/Students for selected Assessment
    useEffect(() => {
        if (!selectedAssessmentId) {
            setMarks([]);
            setStudents([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const assessment = assessments.find(a => a.id === selectedAssessmentId);
                if (!assessment) return;

                // We need students of the batch
                // We can fetch marks, which includes student data if they have marks
                // But we also need students who DON'T have marks yet.
                // So we need: 1. Batch Students, 2. Existing Marks.

                // For simplicity, let's fetch existing marks.
                // Use a server action to get (Students + Marks) combined would be better.
                // But let's try to fetch marks first.

                const existingMarks = await getAssessmentMarks(selectedAssessmentId);

                // Note: We are missing a "getStudentsByBatch" call here to populate the rows 
                // for students who haven't been graded yet.
                // I will add a placeholder for now or we need a new action.

                setMarks(existingMarks);
            } catch (e) {
                toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedAssessmentId, assessments]);

    const handleCreateAssessment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await createAssessment({
                name: formData.get("name") as string,
                date: new Date(formData.get("date") as string),
                totalMarks: Number(formData.get("totalMarks")),
                batchId: selectedBatchId,
                subjectId: formData.get("subjectId") as string
            });
            toast.success("মূল্যায়ন তৈরি করা হয়েছে");
            // Refresh assessments
            const res = await getBatchAssessments(selectedBatchId, selectedSubjectId === "all" ? undefined : selectedSubjectId);
            setAssessments(res);
        } catch (e) {
            toast.error("তৈরি করতে ব্যর্থ হয়েছে");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali">গ্রেড বুক (Admin)</h1>
                <p className="text-zinc-500 font-bengali">অ্যাকাডেমিক ফলাফল ব্যবস্থাপনা এবং নম্বর এন্ট্রি।</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="font-bengali">ব্যাচ</Label>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="font-bengali">
                                <SelectValue placeholder="ব্যাচ নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent maxHeight="200px">
                                {batches.map(b => (
                                    <SelectItem key={b.id} value={b.id} className="font-bengali">{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bengali">বিষয়</Label>
                        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedBatchId}>
                            <SelectTrigger className="font-bengali">
                                <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-bengali">সব বিষয়</SelectItem>
                                {subjects.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="font-bengali">{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 font-bengali gap-2" disabled={!selectedBatchId}>
                                    <Plus className="w-4 h-4" />
                                    নতুন এক্সাম তৈরি করুন
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="font-bengali">নতুন মূল্যায়ন / এক্সাম</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateAssessment} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="font-bengali">এক্সামের নাম</Label>
                                        <Input name="name" placeholder="উদা: ফার্স্ট সেমিস্টার ফাইনাল" required className="font-bengali" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bengali">বিষয়</Label>
                                        <Select name="subjectId" required>
                                            <SelectTrigger className="font-bengali">
                                                <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map(s => (
                                                    <SelectItem key={s.id} value={s.id} className="font-bengali">{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bengali">তারিখ</Label>
                                        <Input name="date" type="date" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bengali">মোট নম্বর</Label>
                                        <Input name="totalMarks" type="number" defaultValue={100} required />
                                    </div>
                                    <Button type="submit" className="w-full bg-teal-600 font-bengali">তৈরি করুন</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Assessments List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold font-bengali flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        এক্সাম তালিকা
                    </h3>
                    {assessments.length === 0 ? (
                        <div className="text-center p-8 border rounded-lg border-dashed text-zinc-500 font-bengali text-sm">
                            কোনো এক্সাম পাওয়া যায়নি
                        </div>
                    ) : (
                        assessments.map(a => (
                            <div
                                key={a.id}
                                onClick={() => setSelectedAssessmentId(a.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedAssessmentId === a.id ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-500/20' : 'bg-white hover:bg-zinc-50'}`}
                            >
                                <div className="font-medium font-bengali">{a.name}</div>
                                <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                                    <span className="font-bengali">{a.subject?.name}</span>
                                    <span>{new Date(a.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Marks Entry */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="font-bengali">ফলাফল এন্ট্রি</CardTitle>
                                <CardDescription className="font-bengali">সিলেক্ট করা এক্সামের নম্বর ইনপুট দিন</CardDescription>
                            </div>
                            {selectedAssessmentId && (
                                <Button className="bg-teal-600 font-bengali gap-2">
                                    <Save className="w-4 h-4" />
                                    সেভ করুন
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {!selectedAssessmentId ? (
                                <div className="text-center py-20 text-zinc-500 font-bengali">
                                    বাম পাশ থেকে একটি এক্সাম নির্বাচন করুন
                                </div>
                            ) : (
                                <div className="text-center py-10 text-zinc-400 font-bengali italic">
                                    (ছাত্র লোড করার ফাংশনালিটি সম্পূর্ণ করা প্রয়োজন - বর্তমানে ডেটাবেসে থাকা মার্কস দেখানো হবে)
                                    <Table className="mt-4 text-left">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ছাত্র</TableHead>
                                                <TableHead>প্রাপ্ত নম্বর</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {marks.map(m => (
                                                <TableRow key={m.id}>
                                                    <TableCell>{m.student?.fullName || m.studentId}</TableCell>
                                                    <TableCell>{m.obtainedMark}</TableCell>
                                                </TableRow>
                                            ))}
                                            {marks.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="text-center">কোনো ডেটা নেই</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
