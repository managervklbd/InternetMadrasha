
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getStudentInvoices } from "@/lib/actions/billing-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Printer, Loader2 } from "lucide-react";

export function PaymentHistoryModal({ studentId, studentName }: { studentId: string, studentName: string }) {
    const [open, setOpen] = useState(false);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getStudentInvoices(studentId).then(data => {
                setInvoices(data);
                setLoading(false);
            });
        }
    }, [open, studentId]);

    const getMonthName = (month: number) => {
        const date = new Date();
        date.setMonth(month - 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full font-bengali">
                    <Receipt className="w-4 h-4 mr-2" />
                    পেমেন্ট ইতিহাস দেখুন
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-bengali text-xl">পেমেন্ট ইতিহাস - {studentName}</DialogTitle>
                </DialogHeader>

                <div className="border rounded-md overflow-hidden mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bengali">মাস/বছর</TableHead>
                                <TableHead className="font-bengali">পরিমান</TableHead>
                                <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                                <TableHead className="font-bengali">পেমেন্ট মেথড</TableHead>
                                <TableHead className="font-bengali">অ্যাকশন ID</TableHead>
                                <TableHead className="font-bengali text-right">রিসিপ্ট</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
                                    </TableCell>
                                </TableRow>
                            ) : invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500 font-bengali">
                                        কোন পেমেন্ট তথ্য পাওয়া যায়নি
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{getMonthName(invoice.month)} {invoice.year}</span>
                                                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline-block">Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono font-bold">৳{invoice.amount}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'UNPAID' ? 'destructive' : 'secondary'}>
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase">
                                                    {invoice.transactions?.[0]?.cardType || (invoice.status === 'PAID' ? 'Manual' : '-')}
                                                </span>
                                                {invoice.transactions?.[0]?.tranDate && (
                                                    <span className="text-[10px] text-zinc-400 font-mono">
                                                        {new Date(invoice.transactions[0].tranDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {invoice.transactions?.[0]?.tranId ? (
                                                <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-600 select-all">
                                                    {invoice.transactions[0].tranId}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-300">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}>
                                                <Printer className="w-4 h-4 text-zinc-500 hover:text-teal-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
