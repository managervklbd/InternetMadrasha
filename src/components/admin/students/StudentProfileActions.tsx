"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { resendStudentInvitation } from "@/lib/actions/student-actions";
import { toast } from "sonner";

export function StudentProfileActions({ studentId }: { studentId: string }) {
    const [loading, setLoading] = useState(false);

    const handleResend = async () => {
        setLoading(true);
        try {
            const res = await resendStudentInvitation(studentId);
            if (res?.success) {
                toast.success("সফল! ইনভাইটেশন ইমেইল পুনরায় পাঠানো হয়েছে।");
            } else {
                throw new Error(res?.error || "Failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("ব্যর্থ! ইমেইল পাঠানো সম্ভব হয়নি।");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={loading}
                className="gap-2 font-bengali"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "পাঠানো হচ্ছে..." : "রিসেট ও ইমেইল পাঠান"}
            </Button>
        </div>
    );
}
