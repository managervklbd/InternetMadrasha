"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CollectPaymentModal } from "./CollectPaymentModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function DonorList({ donors }: { donors: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bengali">নাম</TableHead>
                        <TableHead className="font-bengali">মোবাইল</TableHead>
                        <TableHead className="font-bengali">কমিটি</TableHead>
                        <TableHead className="font-bengali">দানের ধরন</TableHead>
                        <TableHead className="font-bengali">নির্ধারিত টাকা</TableHead>
                        <TableHead className="font-bengali">মোট দান</TableHead>
                        <TableHead className="font-bengali text-right">কার্যক্রম</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {donors.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-zinc-500 font-bengali">
                                কোন দাতা পাওয়া যায়নি
                            </TableCell>
                        </TableRow>
                    ) : (
                        donors.map((donor) => (
                            <TableRow key={donor.id}>
                                <TableCell className="font-medium font-bengali">{donor.name}</TableCell>
                                <TableCell className="font-mono text-xs">{donor.phone || "-"}</TableCell>
                                <TableCell className="font-bengali text-sm">{donor.committee || "-"}</TableCell>
                                <TableCell className="font-bengali text-sm">
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${donor.type === 'MONTHLY' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {donor.type === 'MONTHLY' ? 'মাসিক' : 'সাধারণ'}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono font-bold text-zinc-600">
                                    {donor.fixedAmount ? `৳${donor.fixedAmount}` : '-'}
                                </TableCell>
                                <TableCell className="font-bold font-mono">৳{donor.totalDonated || 0}</TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-2">
                                    <CollectPaymentModal donor={donor} />
                                    <Link href={`/admin/donations/donors/${donor.id}`}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Eye className="w-4 h-4 text-zinc-500" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div >
    );
}
