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
import { toast } from "sonner";

export default function MarksPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Form State
    const [assessmentName, setAssessmentName] = useState("");
    const [totalMarks, setTotalMarks] = useState("100");

    useEffect(() => {
        const fetch = async () => {
            try {
                const b = await getAssignedBatches();
                setBatches(b);
                if (b.length > 0) setSelectedBatchId(b[0].id);
            } catch (err) {
                console.error(err);
                toast.error("ব্যাচ লোড করতে সমস্যা হয়েছে।");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const currentBatch = batches.find(b => b.id === selectedBatchId);
    const students = currentBatch?.enrollments?.map((e: any) => e.student) || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali">গ্রেড বুক</h1>
                    <p className="text-zinc-500 text-lg font-bengali">পরীক্ষা পরিচালনা করুন এবং শিক্ষার্থীদের নম্বর এন্ট্রি করুন। অ্যাডমিন পাবলিশ না করা পর্যন্ত ফলাফল ড্রাফট হিসেবে থাকবে।</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Setup Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bengali">মূল্যায়ন সেটআপ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bengali">ব্যাচ নির্বাচন</Label>
                                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                    <SelectTrigger className="font-bengali">
                                        <SelectValue placeholder="ব্যাচ পছন্দ করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id} className="font-bengali">{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bengali">মূল্যায়নের ধরণ</Label>
                                <Select onValueChange={setAssessmentName}>
                                    <SelectTrigger className="font-bengali">
                                        <SelectValue placeholder="ধরণ নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monthly Test" className="font-bengali">মাসিক পরীক্ষা</SelectItem>
                                        <SelectItem value="Midterm Exam" className="font-bengali">সাময়িক পরীক্ষা</SelectItem>
                                        <SelectItem value="Final Exam" className="font-bengali">বার্ষিক পরীক্ষা</SelectItem>
                                        <SelectItem value="Surprise Quiz" className="font-bengali">ক্লাস টেস্ট / কুইজ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bengali">মোট নম্বর</Label>
                                <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
                            </div>
                            <Button className="w-full bg-teal-600 hover:bg-teal-700 gap-2 h-11 font-bengali">
                                <Plus className="w-4 h-4" />
                                শিট তৈরি করুন
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                        <p className="text-xs text-orange-700 leading-relaxed font-bengali">
                            <strong>সতর্কতা:</strong> শিক্ষকরা নম্বর এন্ট্রি করতে পারলেও, অ্যাডমিন পাবলিশ করার পর তা আর পরিবর্তন করা যাবে না। সংরক্ষণের আগে পুনরায় যাচাই করে নিন।
                        </p>
                    </div>
                </div>

                {/* Entry Grid */}
                <div className="lg:col-span-3">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 h-full">
                        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bengali">নম্বর এন্ট্রি শিট</CardTitle>
                                    <CardDescription className="font-bengali">নিচে প্রতিটি ছাত্রের প্রাপ্ত নম্বর ইনপুট দিন।</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2 font-bengali">
                                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                        এক্সেল ফাইল
                                    </Button>
                                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2 font-bengali">
                                        <Save className="w-4 h-4" />
                                        ড্রাফট সেভ করুন
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <TableRow>
                                        <TableHead className="w-[120px] font-bengali">ছাত্র আইডি</TableHead>
                                        <TableHead className="font-bengali">ছাত্রের নাম</TableHead>
                                        <TableHead className="w-[150px] font-bengali">প্রাপ্ত নম্বর ({totalMarks})</TableHead>
                                        <TableHead className="font-bengali">মন্তব্য</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-zinc-500 italic font-bengali">
                                                লোড হচ্ছে...
                                            </TableCell>
                                        </TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-zinc-500 italic font-bengali">
                                                এন্ট্রি শুরু করতে ব্যাচ নির্বাচন করুন।
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student: any) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-mono text-sm">{student.studentID}</TableCell>
                                                <TableCell>
                                                    <div className="font-semibold font-bengali">{student.fullName}</div>
                                                    <div className="text-[10px] text-zinc-500 font-bengali">{student.mode === "ONLINE" ? "অনলাইন" : "অফলাইন"} মোড</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" placeholder="00" className="h-9 w-24 text-center font-bold" />
                                                </TableCell>
                                                <TableCell>
                                                    <Input placeholder="মন্তব্য লিখুন..." className="h-9 font-bengali" />
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
