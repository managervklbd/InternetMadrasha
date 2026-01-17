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
    Plus,
    FileText,
    Users,
    Clock,
    CheckCircle2,
    Calendar,
    MessageSquare
} from "lucide-react";
import { getAssignedBatches } from "@/lib/actions/teacher-portal-actions";
import {
    createHomework,
    getHomeworkWithSubmissions
} from "@/lib/actions/teacher-academic-actions";
import { Badge } from "@/components/ui/badge";

export default function HomeworkPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [b, h] = await Promise.all([
                getAssignedBatches(),
                getHomeworkWithSubmissions()
            ]);
            setBatches(b);
            setHomeworks(h);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleCreateHomework = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            batchId: formData.get("batchId") as string,
            deadline: new Date(formData.get("deadline") as string),
        };

        try {
            await createHomework(data);
            refreshData();
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            alert("Error creating homework.");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Assignment Lab</h1>
                <p className="text-zinc-500 text-lg">Create, monitor, and evaluate student homework and projects.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Homework Form */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 h-fit lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Assign New Homework</CardTitle>
                        <CardDescription>Fill in the details to publish a new assignment to a batch.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateHomework} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="batchId">Select Batch</Label>
                                <Select name="batchId" required>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Choose Batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Headline / Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Arabic Grammar Basics" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Instructions</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="w-full min-h-[100px] p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="Explain what students need to do..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadline">Submission Deadline</Label>
                                <Input id="deadline" name="deadline" type="datetime-local" required />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-11">
                                <Plus className="w-4 h-4 mr-2" />
                                Publish Assignment
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Homework List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Recent Assignments
                    </h3>

                    {loading ? (
                        <div className="text-center py-20 text-zinc-500 italic">Syncing classroom data...</div>
                    ) : homeworks.length === 0 ? (
                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50/50">
                            <CardContent className="py-20 text-center text-zinc-500 italic">
                                No homework has been assigned yet.
                            </CardContent>
                        </Card>
                    ) : (
                        homeworks.map((hw) => (
                            <Card key={hw.id} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-teal-500/20 transition-all cursor-pointer group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs uppercase tracking-wider">{hw.batch.name}</Badge>
                                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                                            <Calendar className="w-3 h-3" />
                                            Due: {new Date(hw.deadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <CardTitle className="mt-2 text-xl group-hover:text-teal-600 transition-colors">{hw.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-zinc-400" />
                                            <span className="text-sm font-medium">{hw.submissions.length} Submissions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium">4 Graded</span> {/* Placeholder */}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Quick Review
                                        </Button>
                                        <Button variant="secondary" size="sm" className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200">
                                            View Submissions
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
