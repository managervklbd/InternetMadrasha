"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Hash } from "lucide-react";

export function PaymentHistoryTable({ payments }: { payments: any[] }) {
    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 font-bengali">কোন পেমেন্ট রেকর্ড পাওয়া যায়নি</h3>
                <p className="text-sm text-zinc-500 max-w-xs mt-1 font-bengali">আপনার সফল পেমেন্টগুলো এখানে তালিকাভুক্ত করা হবে।</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
            <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                    <TableRow>
                        <TableHead className="font-bengali">তারিখ</TableHead>
                        <TableHead className="font-bengali">ট্রানজেকশন ID</TableHead>
                        <TableHead className="font-bengali">পরিমাণ</TableHead>
                        <TableHead className="font-bengali">মাধ্যম</TableHead>
                        <TableHead className="text-right font-bengali">অবস্থা</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium">
                                {new Date(p.tranDate).toLocaleDateString("bn-BD")}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 uppercase">
                                    <Hash className="w-3 h-3" />
                                    {p.tranId}
                                </div>
                            </TableCell>
                            <TableCell className="font-bold whitespace-nowrap">৳{p.amount}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <CreditCard className="w-3 h-3 text-zinc-400" />
                                    {p.cardType || "Online"}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant="success" className="text-[10px] px-1.5 py-0 font-bengali">
                                    পরিশোধিত
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
