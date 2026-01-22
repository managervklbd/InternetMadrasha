import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAuditLogs } from "@/lib/actions/audit-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Info } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Action mapping for human readability
const ACTION_LABELS: Record<string, string> = {
    "CREATE_LESSON": "নতুন পাঠ তৈরি",
    "DELETE_LESSON": "পাঠ মুছে ফেলা",
    "ADD_RESOURCE": "রিসোর্স যোগ",
    "DELETE_RESOURCE": "রিসোর্স মুছে ফেলা",
    "CREATE_COURSE": "কোর্স তৈরি",
    "CREATE_DEPARTMENT": "বিভাগ তৈরি",
    "CREATE_SEMESTER": "সেমিস্টার তৈরি",
    "CREATE_BATCH": "ব্যাচ তৈরি",
    "USER_CREATE_AUTO": "অটো ইউজার তৈরি",
    // Add more as needed
};

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
                                        <TableCell className="font-mono text-xs whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString('bn-BD', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold whitespace-nowrap">
                                                {ACTION_LABELS[log.action] || log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs">{log.admin.fullName || log.admin.email}</span>
                                                <span className="text-[10px] text-zinc-500">{log.admin.role}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold">{log.targetModel}</span>

                                                {/* Details Viewer */}
                                                {log.details && Object.keys(log.details as object).length > 0 && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-6 w-fit px-2 text-xs text-blue-600 hover:text-blue-700 p-0 font-normal">
                                                                <Info className="w-3 h-3 mr-1" />
                                                                বিস্তারিত দেখুন
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium leading-none">অ্যাকশন ডিটেইলস</h4>
                                                                <div className="text-xs text-muted-foreground bg-zinc-50 dark:bg-zinc-900 p-2 rounded-md font-mono">
                                                                    <pre className="whitespace-pre-wrap break-all">
                                                                        {JSON.stringify(log.details, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
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
