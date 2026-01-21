"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function CommitteeList({ members }: { members: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bengali">নাম</TableHead>
                        <TableHead className="font-bengali">পদবী</TableHead>
                        <TableHead className="font-bengali">মোবাইল</TableHead>
                        <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                        <TableHead className="font-bengali text-right">সংগৃহীত দান</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-zinc-500 font-bengali">
                                কোন কমিটি সদস্য পাওয়া যায়নি
                            </TableCell>
                        </TableRow>
                    ) : (
                        members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium font-bengali">{member.name}</TableCell>
                                <TableCell className="font-bengali">{member.role}</TableCell>
                                <TableCell className="font-mono text-xs">{member.phone || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={member.active ? "success" : "secondary"} className="text-[10px]">
                                        {member.active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold">
                                    {member._count?.collectedDonations || 0} টি
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
