"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DonationReceipt } from "./DonationReceipt";

const PURPOSE_MAP: Record<string, string> = {
    ZAKAT: "যাকাত",
    SADAQAH: "সাদাকাহ",
    NAFL: "নফল",
    DONATION: "দান",
    LILLAH_BOARDING: "লিল্লাহ বোর্ডিং",
    CONSTRUCTION: "নির্মাণ",
    OTHER: "অন্যান্য",
};

const METHOD_MAP: Record<string, string> = {
    CASH: "নগদ",
    BANK: "ব্যাংক",
    MOBILE_BANKING: "মোবাইল ব্যাংকিং",
};

export function DonationList({ donations, settings }: { donations: any[]; settings?: any }) {
    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-50">
                    <TableRow>
                        <TableHead className="font-bengali w-[120px]">রশিদ নং</TableHead>
                        <TableHead className="font-bengali">দাতার নাম</TableHead>
                        <TableHead className="font-bengali">উদ্দেশ্য</TableHead>
                        <TableHead className="font-bengali">টাকা</TableHead>
                        <TableHead className="font-bengali">পেমেন্ট মোড</TableHead>
                        <TableHead className="font-bengali">সংগ্রহকারী</TableHead>
                        <TableHead className="font-bengali">তারিখ</TableHead>
                        <TableHead className="text-right font-bengali px-4">অ্যাকশন</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {donations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-zinc-500 font-bengali">
                                কোন পেমেন্ট পাওয়া যায়নি
                            </TableCell>
                        </TableRow>
                    ) : (
                        donations.map((donation) => (
                            <TableRow key={donation.id} className="hover:bg-zinc-50 transition-colors">
                                <TableCell className="font-mono text-[10px] text-zinc-500">
                                    {donation.receiptNo || "-"}
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="font-bengali text-sm">{donation.donor?.name || "Unknown"}</span>
                                        <span className="text-[10px] text-zinc-400 font-mono italic">{donation.donor?.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-[10px] font-bengali bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                        {PURPOSE_MAP[donation.purpose] || donation.purpose}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold font-mono text-blue-600">৳{donation.amount}</TableCell>
                                <TableCell className="text-zinc-600 font-bengali text-sm">
                                    {METHOD_MAP[donation.paymentMethod] || donation.paymentMethod}
                                </TableCell>
                                <TableCell className="font-bengali text-sm text-zinc-600">
                                    {donation.collectedBy?.name || "-"}
                                </TableCell>
                                <TableCell className="text-[10px] text-zinc-500 font-mono">
                                    {new Date(donation.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right px-4">
                                    <DonationReceipt
                                        donation={donation}
                                        donor={donation.donor}
                                        settings={settings}
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
