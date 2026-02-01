
"use client";

import { Video, FileText, Image as ImageIcon, File, Link as LinkIcon, ExternalLink, Calendar } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ResourceType } from "@prisma/client";

// Reusing types locally for independence
type LessonResource = {
    id: string;
    title: string;
    type: ResourceType;
    url: string;
};

type Lesson = {
    id: string;
    title: string;
    description: string | null;
    createdAt: Date;
    teacher: { fullName: string } | null;
    resources: LessonResource[];
};

export default function StudentLessonList({ lessons }: { lessons: Lesson[] }) {
    if (lessons.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-12 text-center border shadow-sm">
                <div className="flex justify-center mb-4">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium">কোনো লেসন নেই</h3>
                <p className="text-muted-foreground mt-1">শিক্ষক এখনো এই ব্যাচে কোনো লেসন আপলোড করেননি।</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border">
            <Accordion type="single" collapsible className="w-full">
                {lessons.map((lesson) => (
                    <AccordionItem key={lesson.id} value={lesson.id} className="px-6 border-b last:border-0">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex flex-col items-start gap-1 text-left w-full">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <span className="font-semibold text-lg hover:text-primary transition-colors">{lesson.title}</span>
                                    <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(lesson.createdAt).toLocaleDateString('bn-BD')}
                                    </span>
                                </div>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                    <span>শিক্ষক: {lesson.teacher?.fullName || "অ্যাডমিন"}</span>
                                    <span>•</span>
                                    <span>{lesson.resources.length} টি রিসোর্স</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2">
                            <div className="space-y-4">
                                {lesson.description && (
                                    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md text-sm whitespace-pre-wrap border border-zinc-100 dark:border-zinc-700">
                                        {lesson.description}
                                    </div>
                                )}

                                {lesson.resources.length > 0 && (
                                    <>
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">স্টাডি ম্যাটেরিয়ালস</h4>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {lesson.resources.map(res => (
                                                <a
                                                    key={res.id}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group"
                                                >
                                                    <div className="mt-1">
                                                        {res.type === 'VIDEO' && <Video className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />}
                                                        {res.type === 'PDF' && <FileText className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />}
                                                        {res.type === 'IMAGE' && <ImageIcon className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />}
                                                        {res.type === 'FILE' && <File className="h-5 w-5 text-zinc-500 group-hover:scale-110 transition-transform" />}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="font-medium truncate group-hover:text-primary transition-colors">{res.title}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                            <LinkIcon className="h-3 w-3" />
                                                            {res.type} • Click to Open
                                                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
