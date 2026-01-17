import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFinancialSummary, getRevenueTrend } from "@/lib/actions/report-actions";
import { Coins, TrendingUp, AlertCircle, Wallet } from "lucide-react";
import { RevenueTrendChart } from "@/components/admin/reports/FinancialCharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FundType } from "@prisma/client";

export const dynamic = "force-dynamic"; // Ensure real-time data

const fundTypeLabels: Record<FundType, string> = {
    ADMISSION: "ভর্তি ফি (Admission)",
    MONTHLY: "মাসিক বেতন (Monthly)",
    DONATION: "সাধারণ অনুদান (Donation)",
    DANA_COMMITTEE: "দানা কমিটি (Dana Committee)",
};

export default async function FinancialReportsPage() {
    const summary = await getFinancialSummary();
    const trendData = await getRevenueTrend();

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-bengali">
                    আর্থিক প্রতিবেদন (Financial Reports)
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট সংগ্রহ (চলতি মাস)</CardTitle>
                        <Coins className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{summary.totalCollection.toLocaleString('en-BD')}</div>
                        <p className="text-xs text-muted-foreground">
                            গত মাসের সাথে তুলনা
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">বিগত ৬ মাসের আয়</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{trendData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-BD')}</div>
                        <p className="text-xs text-muted-foreground">
                            সর্বমোট রেকর্ডকৃত
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">বকেয়া ফি (Unpaid)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{summary.totalPending.toLocaleString('en-BD')}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary.pendingCount} টি ইনভয়েস বকেয়া
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">নেট ব্যালেন্স</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{(summary.totalCollection).toLocaleString('en-BD')}</div>
                        <p className="text-xs text-muted-foreground">
                            বর্তমান স্থিতি (আনুমানিক)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>মাসিক আয়ের প্রবণতা</CardTitle>
                        <CardDescription>
                            গত ৬ মাসে মাদ্রাসার আয়ের গ্রাফ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueTrendChart data={trendData} />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>ফান্ড অনুযায়ী বিবরণ</CardTitle>
                        <CardDescription>
                            চলতি মাসে খাত অনুযায়ী আয় (Ledger)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>খাতের নাম</TableHead>
                                    <TableHead className="text-right">পরিমাণ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.fundBreakdown.length > 0 ? (
                                    summary.fundBreakdown.map((fund) => (
                                        <TableRow key={fund.fundType}>
                                            <TableCell className="font-medium">
                                                {fundTypeLabels[fund.fundType] || fund.fundType}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ৳{fund.amount.toLocaleString('en-BD')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                            কোন তথ্য পাওয়া যায়নি
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
