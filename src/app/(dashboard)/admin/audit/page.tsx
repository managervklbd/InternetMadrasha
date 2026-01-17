import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAuditLogs } from "@/lib/actions/audit-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
    const logs = await getAuditLogs(100);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-bengali">
                    অডিট লগ (Audit Trace)
                </h2>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-orange-600" />
                        <CardTitle>সিস্টেম অ্যাকশন হিস্ট্রি</CardTitle>
                    </div>
                    <CardDescription>
                        অ্যাডমিন এবং সিস্টেমের গুরুত্বপূর্ণ পরিবর্তনের রেকর্ড
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>সময় (Time)</TableHead>
                                <TableHead>অ্যাকশন (Action)</TableHead>
                                <TableHead>অ্যাডমিন (Actor)</TableHead>
                                <TableHead>বিবরণ (Details)</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs">
                                            {new Date(log.createdAt).toLocaleString('bn-BD')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs">{log.admin.email}</span>
                                                <span className="text-[10px] text-zinc-500">{log.admin.role}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-xs text-zinc-600 dark:text-zinc-400" title={JSON.stringify(log.details)}>
                                            {log.targetModel}: {log.targetId}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-zinc-500">
                                            {log.ipAddress || "N/A"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        কোনো লগ রেকর্ড পাওয়া যায়নি
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
