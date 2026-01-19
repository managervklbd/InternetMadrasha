import { getStudentDashboardData, getStudentInvoices } from "@/lib/actions/student-portal-actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { PaymentStatusHandler } from "./PaymentComponents";
import { InvoiceTable } from "./InvoiceTable";

export default async function StudentBillingPage() {
    const { profile } = await getStudentDashboardData();
    const { issued, upcoming } = await getStudentInvoices();

    // Serialize to plain objects to avoid "moduleId is not a function" or serializability issues
    const invoices = JSON.parse(JSON.stringify(issued));
    const advanceMonths = JSON.parse(JSON.stringify(upcoming));

    return (
        <div className="space-y-8">
            <Suspense fallback={null}>
                <PaymentStatusHandler />
            </Suspense>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
                    <p className="text-zinc-500 text-lg">View your payment history and pay your monthly fees securely.</p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg border border-teal-200 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-semibold text-teal-700">SSLCOMMERZ Secured</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader>
                            <CardTitle>Payment Dashboard</CardTitle>
                            <CardDescription>Select issued invoices or advance months to pay together.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InvoiceTable invoices={invoices} upcoming={advanceMonths} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* ... Right Sidebar ... */}
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100">
                        <CardHeader>
                            <CardTitle className="text-lg">Payment Methods</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-zinc-500">We accept secure payments via credit cards, bKash, Rocket, and other mobile banking through SSLCOMMERZ.</p>
                            <div className="grid grid-cols-3 gap-2 grayscale hover:grayscale-0 transition-all opacity-50">
                                <div className="h-8 bg-white border rounded flex items-center justify-center p-1">
                                    <span className="text-[10px] font-bold">bKash</span>
                                </div>
                                <div className="h-8 bg-white border rounded flex items-center justify-center p-1">
                                    <span className="text-[10px] font-bold">VISA</span>
                                </div>
                                <div className="h-8 bg-white border rounded flex items-center justify-center p-1">
                                    <span className="text-[10px] font-bold">Rocket</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
