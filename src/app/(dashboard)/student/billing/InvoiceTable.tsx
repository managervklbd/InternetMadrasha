"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Download, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PaymentActionButton, MultiPaymentButton } from "./PaymentComponents";

export function InvoiceTable({ invoices, upcoming = [] }: { invoices: any[], upcoming?: any[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const allInvoices = [...invoices, ...upcoming.map(u => ({ ...u, status: "UNPAID_ADVANCE" }))];

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        const unpaidIds = allInvoices.filter(i => i.status !== "PAID").map(i => i.id);
        if (selectedIds.length === unpaidIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(unpaidIds);
        }
    };

    const unpaidInvoices = allInvoices.filter(i => i.status !== "PAID");

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <div className="p-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {selectedIds.length}
                        </div>
                        <div>
                            <p className="font-bold text-teal-900 dark:text-teal-100">Selected for Payment</p>
                            <p className="text-sm text-teal-700 dark:text-teal-400">Total: ৳{allInvoices.filter(i => selectedIds.includes(i.id)).reduce((acc, i) => acc + i.amount, 0)}</p>
                        </div>
                    </div>
                    <MultiPaymentButton invoiceIds={selectedIds} />
                </div>
            )}

            <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.length > 0 && selectedIds.length === unpaidInvoices.length}
                                    onCheckedChange={toggleAll}
                                    disabled={unpaidInvoices.length === 0}
                                />
                            </TableHead>
                            <TableHead>Month/Year</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic">
                                    No invoices issued yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            allInvoices.map((inv) => (
                                <TableRow
                                    key={inv.id}
                                    className={cn(
                                        selectedIds.includes(inv.id) ? "bg-teal-50/30 dark:bg-teal-900/10" : "",
                                        inv.status === "PAID" ? "opacity-60 grayscale-[0.5]" : ""
                                    )}
                                >
                                    <TableCell>
                                        <Checkbox
                                            disabled={inv.status === "PAID"}
                                            checked={selectedIds.includes(inv.id)}
                                            onCheckedChange={() => toggleSelect(inv.id)}
                                            className={inv.status === "PAID" ? "opacity-20 cursor-not-allowed" : ""}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {inv.month}/{inv.year}
                                            {inv.status === "PAID" && (
                                                <Badge variant="success" className="h-4 text-[9px] px-1 py-0">Verified</Badge>
                                            )}
                                            {inv.isAdvance && (
                                                <Badge variant="outline" className="h-4 text-[9px] px-1 py-0 text-amber-600 border-amber-200">Advance</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">৳{inv.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={inv.status === "PAID" ? "success" : "warning"} className="capitalize">
                                            {inv.status === "UNPAID_ADVANCE" ? "Advance" : inv.status.toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {inv.status === "PAID" ? (
                                                <Link href={`/student/billing/invoice/${inv.id}`} target="_blank">
                                                    <Button variant="outline" size="sm" className="gap-2 border-zinc-200 hover:bg-zinc-100">
                                                        <Download className="w-3.5 h-3.5" />
                                                        Invoice
                                                    </Button>
                                                </Link>
                                            ) : inv.isAdvance ? (
                                                <span className="text-xs text-zinc-400 italic">Pre-Issue</span>
                                            ) : (
                                                <PaymentActionButton invoiceId={inv.id} status={inv.status} />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {unpaidInvoices.length > 1 && (
                <div className="flex justify-end p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="text-right space-y-2">
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Batch Payment Summary</p>
                        <div className="flex items-center justify-end gap-6">
                            <div>
                                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                                    ৳{allInvoices.filter(i => selectedIds.includes(i.id)).reduce((acc, i) => acc + i.amount, 0)}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-bold">{selectedIds.length} months selected</p>
                            </div>
                            <MultiPaymentButton invoiceIds={selectedIds} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
