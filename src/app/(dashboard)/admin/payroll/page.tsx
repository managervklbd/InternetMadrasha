
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMonthlyPayrollOverview } from "@/lib/actions/payroll-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { MonthSelector } from "./MonthSelector";
import { Badge } from "@/components/ui/badge";

type Props = {
    searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function AdminPayrollPage({ searchParams }: Props) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return redirect("/");

    const { month, year } = await searchParams;
    const currentDate = new Date();
    const selectedMonth = month ? parseInt(month) : currentDate.getMonth() + 1; // 1-12
    const selectedYear = year ? parseInt(year) : currentDate.getFullYear();

    const data = await getMonthlyPayrollOverview(selectedMonth, selectedYear);

    if ('error' in data) return <div>Error loading data</div>;

    const { teachers, summary } = data;

    const monthNames = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-bengali">শিক্ষক বেতন ব্যবস্থাপনা</h1>
                    <p className="text-muted-foreground">বেতন প্রদান এবং হিসেব দেখুন</p>
                </div>
                <MonthSelector currentMonth={selectedMonth} currentYear={selectedYear} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট বেতন (ভিত্তি)</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳ {summary.totalBaseSalary.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">পরিশোধিত</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">৳ {summary.totalPaid.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">বাকি আছে</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summary.pendingCount} জন</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-bengali">{monthNames[selectedMonth - 1]} {selectedYear} - তালিকা</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>শিক্ষকের নাম</TableHead>
                                <TableHead>পদবী</TableHead>
                                <TableHead className="text-right">মূল বেতন</TableHead>
                                <TableHead>স্ট্যাটাস</TableHead>
                                <TableHead className="text-right">অ্যাকশন</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        কোনো সক্রিয় শিক্ষক পাওয়া যায়নি
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teachers.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.fullName}</TableCell>
                                        <TableCell>{teacher.designation}</TableCell>
                                        <TableCell className="text-right">৳ {(teacher.salary || 0).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {teacher.paymentStatus === 'PAID' ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">পরিশোধিত</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">বাকি</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {teacher.paymentStatus === 'PAID' ? (
                                                <Link href={`/admin/payroll/print/${teacher.paymentId}`}>
                                                    <Button variant="secondary" size="sm">মানি রিসিপ্ট</Button>
                                                </Link>
                                            ) : (
                                                <Link href={`/admin/payroll/pay/${teacher.id}?month=${selectedMonth}&year=${selectedYear}`}>
                                                    <Button size="sm">টাকা দিন</Button>
                                                </Link>
                                            )}
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
