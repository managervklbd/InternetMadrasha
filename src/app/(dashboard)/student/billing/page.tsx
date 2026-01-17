import { getStudentDashboardData } from "@/lib/actions/student-portal-actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    Download,
    AlertCircle,
    ExternalLink,
    ShieldCheck
} from "lucide-react";

export default async function StudentBillingPage() {
    const { profile, latestInvoice } = await getStudentDashboardData();

    // In a real app we would fetch all invoices for the student
    const invoices = latestInvoice ? [latestInvoice] : [];

    return (
        <div className="space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader>
                            <CardTitle>Monthly Invoices</CardTitle>
                            <CardDescription>A record of all your issued fees and their payment status.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <TableRow>
                                        <TableHead>Month/Year</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-zinc-500 italic">
                                                No invoices issued yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-medium">{inv.month}/{inv.year}</TableCell>
                                                <TableCell>৳{inv.amount}</TableCell>
                                                <TableCell>
                                                    <Badge variant={inv.status === "PAID" ? "success" : "warning"} className="capitalize">
                                                        {inv.status.toLowerCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {inv.status === "UNPAID" ? (
                                                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2">
                                                            Pay Now
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" className="gap-2">
                                                            <Download className="w-4 h-4" />
                                                            Invoice
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
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

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            <strong>Important:</strong> Late fee of ৳200 may be applicable if payment is made after the 10th of the month.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
