
import { Metadata } from 'next';
import { getAdminHomeworkReport } from '@/lib/actions/report-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import AdminHomeworkManager from './AdminHomeworkManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
    title: 'Homework Management | Admin Dashboard',
    description: 'Manage homework and view submissions',
};

type Props = {
    searchParams: Promise<{ batchId?: string }>;
};

export default async function AdminHomeworkPage({ searchParams }: Props) {
    const { batchId } = await searchParams;
    const { data: submissions } = await getAdminHomeworkReport(100);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali">হোমওয়ার্ক ম্যানেজমেন্ট</h1>
                <p className="text-zinc-500 text-lg font-bengali">ছাত্রদের জন্য হোমওয়ার্ক তৈরি করুন এবং জমা দেওয়া কাজগুলো দেখুন।</p>
            </div>

            <Tabs defaultValue={batchId ? "manage" : "report"} className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
                    <TabsTrigger value="report" className="font-bengali px-8 rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        রিপোর্ট ও সাবমিশন
                    </TabsTrigger>
                    <TabsTrigger value="manage" className="font-bengali px-8 rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        হোমওয়ার্ক ম্যানেজ করুন
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="report" className="space-y-6">
                    <Card className="border-teal-100 dark:border-teal-900 shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-bengali">সাম্প্রতিক জমা</CardTitle>
                            <CardDescription>সর্বশেষ ১০০টি সাবমিশন দেখানো হচ্ছে</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <TableHead className="font-bold text-teal-900 dark:text-teal-100 font-bengali">ছাত্র/ছাত্রী</TableHead>
                                        <TableHead className="font-bold text-teal-900 dark:text-teal-100 font-bengali">ব্যাচ ও শিক্ষক</TableHead>
                                        <TableHead className="font-bold text-teal-900 dark:text-teal-100 font-bengali">হোমওয়ার্ক</TableHead>
                                        <TableHead className="font-bold text-teal-900 dark:text-teal-100 font-bengali">জমা দেওয়ার সময়</TableHead>
                                        <TableHead className="font-bold text-teal-900 dark:text-teal-100 font-bengali">স্ট্যাটাস</TableHead>
                                        <TableHead className="font-bold text-teal-900 dark:text-teal-100 font-bengali text-right">মার্কস</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-zinc-500 font-bengali">
                                                কোনো তথ্য পাওয়া যায়নি
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        submissions.map((sub) => (
                                            <TableRow key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar
                                                            name={sub.studentName}
                                                            src={sub.studentPhoto || undefined}
                                                            className="w-9 h-9 border border-zinc-200 dark:border-zinc-800"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-zinc-900 dark:text-zinc-100 font-bengali">{sub.studentName}</span>
                                                            <span className="text-xs text-zinc-500 font-mono">{sub.studentId}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-medium text-teal-700 dark:text-teal-300 font-bengali">{sub.batchName}</span>
                                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                            <span>শিক্ষক:</span>
                                                            <span className="font-bengali">{sub.teacherName || 'অ্যাডমিন'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 line-clamp-1 max-w-[200px]" title={sub.homeworkTitle}>
                                                        {sub.homeworkTitle}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm text-zinc-600 dark:text-zinc-400">
                                                        <span className="font-bengali">{format(new Date(sub.submittedAt), 'd MMM, yyyy', { locale: bn })}</span>
                                                        <span className="text-xs text-zinc-400 font-mono">{format(new Date(sub.submittedAt), 'h:mm a')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={sub.status === 'GRADED' ? 'default' : 'secondary'} className={`font-bengali font-normal ${sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                        {sub.status === 'GRADED' ? 'মূল্যায়িত' : 'জমা দেওয়া হয়েছে'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {sub.grade ? (
                                                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{sub.grade}</span>
                                                    ) : (
                                                        <span className="text-zinc-400 text-xs">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="manage">
                    <AdminHomeworkManager initialBatchId={batchId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
