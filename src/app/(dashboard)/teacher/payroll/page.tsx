
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTeacherPaymentHistory } from "@/lib/actions/payroll-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function TeacherPayrollPage() {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") return redirect("/");

    const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!teacher) return <div>Teacher profile not found</div>;

    const history = await getTeacherPaymentHistory(teacher.id);

    const formatMonth = (m: number) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[m - 1];
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-bengali">আমার বেতন বিবরণী</h1>
                <p className="text-muted-foreground">আপনার বেতনের ইতিহাস</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>পেমেন্ট হিস্ট্রি</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Month</TableHead>
                                <TableHead className="text-right">Base Salary</TableHead>
                                <TableHead className="text-right">Bonus</TableHead>
                                <TableHead className="text-right">Deduction</TableHead>
                                <TableHead className="text-right">Total Received</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        কোনো পেমেন্ট তথ্য পাওয়া যায়নি
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((pay) => (
                                    <TableRow key={pay.id}>
                                        <TableCell>{format(pay.paymentDate, "dd MMM, yyyy")}</TableCell>
                                        <TableCell className="font-medium">{formatMonth(pay.month)} {pay.year}</TableCell>
                                        <TableCell className="text-right">{pay.basicSalary.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-green-600">
                                            {pay.bonus ? `+${pay.bonus}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {pay.deduction ? `-${pay.deduction}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">৳ {pay.amount.toLocaleString()}</TableCell>
                                        <TableCell>{pay.method}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {pay.status}
                                            </Badge>
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
