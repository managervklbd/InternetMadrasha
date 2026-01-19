"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { initiateInvoicePayment } from "@/lib/actions/payment-actions";

export function PaymentActionButton({ invoiceId, status }: { invoiceId: string, status: string }) {
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            const res = await initiateInvoicePayment([invoiceId]);
            if (res.success && res.url) {
                window.location.href = res.url;
            } else {
                toast.error(res.error || "পেমেন্ট শুরু করা ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("একটি ত্রুটি হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    if (status === "PAID") {
        return null; // Don't show button if paid
    }

    return (
        <Button
            size="sm"
            disabled={loading}
            onClick={handlePay}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
            {!loading && <ExternalLink className="w-3 h-3 mr-2" />}
            Pay Now
        </Button>
    );
}

export function PaymentStatusHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const status = searchParams.get("status");
        if (status === "success") {
            toast.success("পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!", {
                description: "আপনার ইনভয়েস আপডেট করা হয়েছে।"
            });
            router.replace("/student/billing");
        } else if (status === "fail") {
            toast.error("পেমেন্ট ব্যর্থ হয়েছে", {
                description: "দয়া করে আবার চেষ্টা করুন।"
            });
            router.replace("/student/billing");
        } else if (status === "cancel") {
            toast.info("পেমেন্ট বাতিল করা হয়েছে");
            router.replace("/student/billing");
        } else if (status === "error") {
            toast.error("পেমেন্ট প্রসেস করতে ত্রুটি হয়েছে");
            router.replace("/student/billing");
        }
    }, [searchParams, router]);

    return null;
}

export function MultiPaymentButton({ invoiceIds }: { invoiceIds: string[] }) {
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        if (invoiceIds.length === 0) return;
        setLoading(true);
        try {
            const res = await initiateInvoicePayment(invoiceIds);
            if (res.success && res.url) {
                window.location.href = res.url;
            } else {
                toast.error(res.error || "পেমেন্ট শুরু করা ব্যর্থ হয়েছে");
            }
        } catch (error) {
            toast.error("একটি ত্রুটি হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 shadow-lg font-bold gap-3 px-8"
            disabled={loading || invoiceIds.length === 0}
            onClick={handlePay}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
            Pay for {invoiceIds.length} Months
        </Button>
    );
}
