"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportFinancialReport } from "@/lib/actions/report-actions";

export function ExportReportButton() {
    const [exporting, setExporting] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await exportFinancialReport();
            if (res.success && res.csv) {
                const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({ title: "সফল", description: "রিপোর্ট ডাউনলোড শুরু হয়েছে" });
            } else {
                toast({ variant: "destructive", title: "ব্যর্থ", description: res.error || "রিপোর্ট তৈরি করতে ব্যর্থ" });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "রিপোর্ট ডাউনলোডে সমস্যা হয়েছে" });
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="gap-2 h-11 font-bengali"
        >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            রিপোর্ট এক্সপোর্ট
        </Button>
    );
}
