"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Video, FileText, Image as ImageIcon, File, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createLesson, addResourceToLesson, deleteLesson, deleteResource } from "@/lib/actions/lesson-actions";
import { ResourceType } from "@prisma/client";

// Define strict types for props
type LessonResource = {
    id: string;
    title: string;
    type: ResourceType; // Ensure this matches the enum from Prisma
    url: string;
};

type Lesson = {
    id: string;
    title: string;
    description: string | null;
    resources: LessonResource[];
};

export default function LessonManager({ batchId, lessons }: { batchId: string, lessons: Lesson[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isResourceOpen, setIsResourceOpen] = useState(false);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form States
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonDesc, setLessonDesc] = useState("");

    const [resourceTitle, setResourceTitle] = useState("");
    const [resourceType, setResourceType] = useState<ResourceType>("VIDEO");
    const [resourceUrl, setResourceUrl] = useState("");

    const handleCreateLesson = async () => {
        if (!lessonTitle) return;
        setLoading(true);
        try {
            await createLesson({ title: lessonTitle, description: lessonDesc, batchId });
            toast.success("লেসন তৈরি করা হয়েছে");
            setIsCreateOpen(false);
            setLessonTitle("");
            setLessonDesc("");
        } catch (error) {
            toast.error("লেসন তৈরি করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    const handleAddResource = async () => {
        if (!activeLessonId || !resourceTitle || !resourceUrl) return;
        setLoading(true);
        try {
            await addResourceToLesson({
                lessonId: activeLessonId,
                title: resourceTitle,
                type: resourceType,
                url: resourceUrl
            });
            toast.success("রিসোর্স যুক্ত করা হয়েছে");
            setIsResourceOpen(false);
            setResourceTitle("");
            setResourceUrl("");
            // keep type
        } catch (error) {
            toast.error("রিসোর্স যুক্ত করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!confirm("আপনি কি নিশ্চিত এই লেসনটি মুছে ফেলতে চান?")) return;
        try {
            await deleteLesson(id);
            toast.success("লেসন মুছে ফেলা হয়েছে");
        } catch (error) {
            toast.error("মুছে ফেলতে সমস্যা হয়েছে");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            নতুন লেসন যুক্ত করুন
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>নতুন লেসন তৈরি</DialogTitle>
                            <DialogDescription>
                                লেসনের শিরোনাম এবং বিবরণ দিন। পরে আপনি ভিডিও বা ফাইল যুক্ত করতে পারবেন।
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>শিরোনাম</Label>
                                <Input
                                    placeholder="উদাহরণ: ফিকহ পরিচিতি - ক্লাস ১"
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>বিবরণ (ঐচ্ছিক)</Label>
                                <Textarea
                                    placeholder="ক্লাসের আলোচ্য বিষয়..."
                                    value={lessonDesc}
                                    onChange={(e) => setLessonDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>বাতিল</Button>
                            <Button onClick={handleCreateLesson} disabled={loading}>তৈরি করুন</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border">
                {lessons.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        কোনো লেসন নেই। 'নতুন লেসন যুক্ত করুন' বাটনে ক্লিক করে শুরু করুন।
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {lessons.map((lesson) => (
                            <AccordionItem key={lesson.id} value={lesson.id} className="px-6 border-b last:border-0">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="font-semibold text-lg">{lesson.title}</span>
                                        {lesson.description && (
                                            <span className="text-sm text-muted-foreground font-normal line-clamp-1">{lesson.description}</span>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 pt-2">
                                    <div className="space-y-4">
                                        {lesson.description && (
                                            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md text-sm whitespace-pre-wrap">
                                                {lesson.description}
                                            </div>
                                        )}

                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">রিসোর্স সমূহ</h4>

                                        <div className="grid gap-3 md:grid-cols-2">
                                            {lesson.resources.map(res => (
                                                <div key={res.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group relative">
                                                    <div className="mt-1">
                                                        {res.type === 'VIDEO' && <Video className="h-5 w-5 text-red-500" />}
                                                        {res.type === 'PDF' && <FileText className="h-5 w-5 text-orange-500" />}
                                                        {res.type === 'IMAGE' && <ImageIcon className="h-5 w-5 text-blue-500" />}
                                                        {res.type === 'FILE' && <File className="h-5 w-5 text-zinc-500" />}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="font-medium truncate">{res.title}</div>
                                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                            <LinkIcon className="h-3 w-3" />
                                                            Open Link
                                                        </a>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            if (confirm("মুছে ফেলতে চান?")) deleteResource(res.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <Button
                                                variant="outline"
                                                className="h-auto py-6 border-dashed flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
                                                onClick={() => {
                                                    setActiveLessonId(lesson.id);
                                                    setIsResourceOpen(true);
                                                }}
                                            >
                                                <Plus className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-sm font-medium">রিসোর্স যোগ করুন</span>
                                            </Button>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t mt-4">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                পুরো লেসন ডিলিট করুন
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>

            {/* Add Resource Dialog */}
            <Dialog open={isResourceOpen} onOpenChange={setIsResourceOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>রিসোর্স যোগ করুন</DialogTitle>
                        <DialogDescription>ভিডিও লিংক, পিডিএফ বা ড্রাইভ লিংক দিন।</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>রিসোর্স টাইপ</Label>
                            <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VIDEO">Video Link (YouTube/Vimeo)</SelectItem>
                                    <SelectItem value="PDF">PDF Document</SelectItem>
                                    <SelectItem value="IMAGE">Image</SelectItem>
                                    <SelectItem value="FILE">Other File</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>শিরোনাম</Label>
                            <Input
                                placeholder="উদাহরণ: পর্ব ১ - ভিডিও"
                                value={resourceTitle}
                                onChange={(e) => setResourceTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>URL / Link</Label>
                            <Input
                                placeholder="https://..."
                                value={resourceUrl}
                                onChange={(e) => setResourceUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">সরাসরি লিংক বা গুগল ড্রাইভ লিংক দিন।</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResourceOpen(false)}>বাতিল</Button>
                        <Button onClick={handleAddResource} disabled={loading}>যুক্ত করুন</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
