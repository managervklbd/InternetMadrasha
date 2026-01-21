"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitHomework } from "@/lib/actions/student-portal-actions";
import { useRouter } from "next/navigation";

export default function HomeworkSubmissionForm({
    homeworkId,
    isOverdue
}: {
    homeworkId: string;
    isOverdue: boolean;
}) {
    const [content, setContent] = useState("");
    const [fileUrls, setFileUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await submitHomework({
                homeworkId,
                content,
                fileUrls
            });
            toast.success("হোমওয়ার্ক জমা দেওয়া হয়েছে");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "জমা দিতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (index: number) => {
        setFileUrls(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isOverdue && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl flex items-start gap-2.5">
                    <Upload className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 dark:text-amber-500 font-bengali leading-relaxed">
                        <strong>সতর্কতা:</strong> ডেডলাইন পার হয়ে গেছে। এটি "বিলম্বিত জমা" হিসেবে চিহ্নিত হবে।
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <Label className="font-bengali text-xs">আপনার উত্তর লিখুন</Label>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="আপনার সমাধান এখানে লিখুন..."
                    className="min-h-[150px] font-bengali focus-visible:ring-teal-600"
                    required
                />
            </div>

            <div className="space-y-3">
                <Label className="font-bengali text-xs">ফাইল আপলোড করুন (চিত্র বা পিডিএফ)</Label>

                <div className="flex flex-wrap gap-2">
                    {fileUrls.map((url, i) => (
                        <div key={i} className="relative group w-20 h-20 border rounded-lg overflow-hidden bg-zinc-50 flex items-center justify-center shadow-sm">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                                {url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                    <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <FileText className="w-8 h-8 text-zinc-400 group-hover:text-teal-600 transition-colors" />
                                )}
                            </a>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}

                    <CldUploadWidget
                        signatureEndpoint="/api/sign-cloudinary-params"
                        onSuccess={(result: any) => {
                            if (result?.info?.secure_url) {
                                setFileUrls(prev => [...prev, result.info.secure_url]);
                            }
                        }}
                        options={{
                            multiple: true,
                            maxFiles: 5,
                            sources: ['local', 'url', 'camera']
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="w-20 h-20 border-2 border-dashed border-zinc-200 hover:border-teal-500 hover:bg-teal-50 transition-all rounded-lg flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-teal-600"
                            >
                                <Upload size={20} />
                                <span className="text-[10px] font-bold">Upload</span>
                            </button>
                        )}
                    </CldUploadWidget>
                </div>
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bengali shadow-lg shadow-teal-600/20" disabled={loading}>
                {loading ? "জমা দেওয়া হচ্ছে..." : "জমা দিন"}
            </Button>
        </form>
    );
}
