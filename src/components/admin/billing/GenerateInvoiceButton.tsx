"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { generateMonthlyInvoices } from "@/lib/actions/billing-actions";
import { useToast } from "@/hooks/use-toast";

export function GenerateInvoiceButton() {
    const { toast } = useToast();
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await generateMonthlyInvoices();
            if (res.success) {
                toast({
                    title: "ইনভয়েস জেনারেশন সম্পন্ন",
                    description: `${res.created} টি নতুন তৈরি, ${res.updated} টি আপডেট, ${res.skipped} টি বাদ (পরিমাণ ০) এবং ${res.existed} টি আগে থেকেই ছিল।`
                });
            } else {
                toast({ variant: "destructive", title: "ব্যর্থ", description: "চালান তৈরি করতে ব্যর্থ" });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "চালান তৈরি করতে সমস্যা হয়েছে" });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2 bg-teal-600 hover:bg-teal-700 h-11 px-6 font-bengali"
        >
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            মাসিক ইনভয়েস জেনারেট করুন
        </Button>
    );
}
