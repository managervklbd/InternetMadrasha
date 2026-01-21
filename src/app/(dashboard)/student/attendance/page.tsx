
import { getStudentAttendanceHistory } from "@/lib/actions/student-portal-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, UserCheck, UserX, Clock } from "lucide-react";

export default async function StudentAttendancePage() {
    const { attendance, stats } = await getStudentAttendanceHistory();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PRESENT": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">উপস্থিত</Badge>;
            case "ABSENT": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">অনুপস্থিত</Badge>;
            case "LATE": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">দেরি</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali text-teal-900 dark:text-teal-50">আমার হাজিরা রিপোর্ট</h1>
                    <p className="text-zinc-500 text-lg font-bengali">আপনার ক্লাসে উপস্থিতির বিস্তারিত ইতিহাস।</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">মোট উপস্থিত</p>
                            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.present} দিন</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">মোট অনুপস্থিত</p>
                            <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.absent} দিন</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">মোট দেরি</p>
                            <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.late} দিন</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-bengali">
                        <CalendarCheck className="w-5 h-5 text-teal-600" />
                        হাজিরা তালিকা
                    </CardTitle>
                    <CardDescription>গত সকল ক্লাসের উপস্থিতির বিবরণ</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>তারিখ</TableHead>
                                <TableHead>ব্যাচ</TableHead>
                                <TableHead>স্ট্যাটাস</TableHead>
                                <TableHead className="text-right">জয়েন টাইম</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendance.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                                        কোন তথ্য পাওয়া যায়নি
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attendance.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            {new Date(record.classSession.date).toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            {record.classSession.batch.name}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(record.status)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs text-zinc-500">
                                            {record.joinTime ? new Date(record.joinTime).toLocaleTimeString('bn-BD') : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
