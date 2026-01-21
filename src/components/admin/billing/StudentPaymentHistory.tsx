"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StudentPaymentReceipt } from "./StudentPaymentReceipt";

export function StudentPaymentHistory({ history, settings }: { history: any[]; settings?: any }) {
    return (
        <div className="rounded-md border overflow-hidden bg-white text-black">
            <Table>
                <TableHeader className="bg-zinc-50">
                    <TableRow>
                        <TableHead className="font-bengali">রশিদ নং</TableHead>
                        <TableHead className="font-bengali">শিক্ষার্থীর নাম</TableHead>
                        <TableHead className="font-bengali">ফান্ড টাইপ</TableHead>
                        <TableHead className="font-bengali">টাকা</TableHead>
                        <TableHead className="font-bengali">বিবরণ</TableHead>
                        <TableHead className="font-bengali">তারিখ</TableHead>
                        <TableHead className="text-right font-bengali px-4">অ্যাকশন</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-zinc-500 font-bengali">
                                কোন পেমেন্ট ইতিহাস পাওয়া যায়নি
                            </TableCell>
                        </TableRow>
                    ) : (
                        history.map((tx) => (
                            <TableRow key={tx.id} className="hover:bg-zinc-50 transition-colors">
                                <TableCell className="font-mono text-[10px] text-zinc-500">
                                    {tx.invoice?.invoiceNo || tx.referenceId || tx.id.slice(-8).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bengali text-sm font-medium">
                                            {tx.invoice?.student?.fullName || "Unknown"}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-mono">
                                            {tx.invoice?.student?.studentID}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-bengali">
                                        {tx.fundType === "MONTHLY" ? "মাসিক ফি" : tx.fundType === "ADMISSION" ? "ভর্তি ফান্ড" : tx.fundType}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold font-mono text-teal-600">৳{tx.amount}</TableCell>
                                <TableCell className="text-zinc-600 text-xs font-bengali">
                                    {tx.description || tx.invoice?.plan?.name || "-"}
                                </TableCell>
                                <TableCell className="text-[10px] text-zinc-500 font-mono">
                                    {new Date(tx.transactionDate).toLocaleDateString("bn-BD")}
                                </TableCell>
                                <TableCell className="text-right px-4">
                                    <StudentPaymentReceipt transaction={tx} settings={settings} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
