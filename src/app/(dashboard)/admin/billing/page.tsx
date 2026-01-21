import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Download,
    ArrowUpRight
} from "lucide-react";

import { FeePlansManager } from "@/components/admin/billing/FeePlansManager";
import { FeeStructureTable } from "@/components/admin/billing/FeeStructureTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFinancialSummary, getStudentPaymentHistory, getRecentTransactions } from "@/lib/actions/report-actions";
import { getSiteSettings } from "@/lib/actions/donation-actions";
import { TreasuryCards } from "@/components/admin/billing/TreasuryCards";
import { StudentPaymentHistory } from "@/components/admin/billing/StudentPaymentHistory";
import { ExportReportButton } from "@/components/admin/billing/ExportReportButton";
import { GenerateInvoiceButton } from "@/components/admin/billing/GenerateInvoiceButton";

export default async function BillingPage() {
    const stats = await getFinancialSummary();
    const history = await getStudentPaymentHistory();
    const settings = await getSiteSettings();
    const recentTransactions = await getRecentTransactions(10);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-600 font-bengali">আর্থিক তহবিল (কোষাগার)</h1>
                    <p className="text-zinc-500 text-lg font-bengali">ফান্ড মনিটর করুন, মাসিক বিলিং পরিচালনা করুন এবং হিসাব সমন্বয় করুন।</p>
                </div>
                <div className="flex gap-3">
                    <ExportReportButton />
                    <GenerateInvoiceButton />
                </div>
            </div>

            <TreasuryCards stats={stats} />

            <div className="space-y-8">
                <Tabs defaultValue="structure" className="space-y-6">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1">
                        <TabsTrigger value="overview" className="font-bengali">ওভারভিউ</TabsTrigger>
                        <TabsTrigger value="history" className="font-bengali">পেমেন্ট ইতিহাস</TabsTrigger>
                        <TabsTrigger value="structure" className="font-bengali">ফি স্ট্রাকচার</TabsTrigger>
                        <TabsTrigger value="plans" className="font-bengali">কাস্টম প্ল্যান</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader>
                                    <CardTitle className="font-bengali">সাম্প্রতিক লেনদেন</CardTitle>
                                    <CardDescription className="font-bengali">ফান্ড ভিত্তিক সকল আয়ের সমন্বিত লেজার রেকর্ড।</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 font-bengali">
                                            <TableRow>
                                                <TableHead>তারিখ</TableHead>
                                                <TableHead>রেফারেন্স</TableHead>
                                                <TableHead>ফান্ড টাইপ</TableHead>
                                                <TableHead>পরিমাণ</TableHead>
                                                <TableHead>বিবরণ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="font-bengali">
                                            {recentTransactions.length > 0 ? (
                                                recentTransactions.map((tx) => (
                                                    <TableRow key={tx.id}>
                                                        <TableCell>{new Date(tx.transactionDate).toLocaleDateString("bn-BD")}</TableCell>
                                                        <TableCell className="font-mono text-xs uppercase text-zinc-500">{tx.referenceId || "N/A"}</TableCell>
                                                        <TableCell>
                                                            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                                                                {tx.fundType === "MONTHLY" ? "মাসিক ফি" : tx.fundType === "ADMISSION" ? "ভর্তি ফি" : tx.fundType === "DONATION" ? "দান" : "কমিটি দান"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="font-bold">৳{tx.amount}</TableCell>
                                                        <TableCell className="text-zinc-500 text-xs">{tx.description || tx.invoice?.student?.fullName || "—"}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell className="text-sm text-zinc-500 italic text-center py-12" colSpan={5}>
                                                        কোন লেনদেন পাওয়া যায়নি।
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader>
                                    <CardTitle className="font-bengali">ফি কালেকশন অ্যানালিটিক্স</CardTitle>
                                    <CardDescription className="font-bengali">এই মাসের কালেকশন স্ট্যাটাস ওভারভিউ।</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Calculated Progress */}
                                    {(() => {
                                        const collected = stats.totalCollection;
                                        const pending = stats.totalPending;
                                        const total = collected + pending;
                                        const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

                                        return (
                                            <>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>টার্গেট পূরণ</span>
                                                        <span className="font-bold">{percentage}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-teal-600 transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 font-bengali">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-zinc-500">সংগ্রহ করা হয়েছে</span>
                                                        <span className="font-semibold">৳{collected}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-zinc-500">বকেয়া আছে</span>
                                                        <span className="font-semibold">৳{pending}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-zinc-500">মোট প্রক্ষেপিত</span>
                                                        <span className="font-bold text-teal-600">৳{total}</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <Button variant="outline" className="w-full mt-4 gap-2">
                                        Re-scan Status
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader>
                                <CardTitle className="font-bengali text-teal-600">শিক্ষার্থী পেমেন্ট ইতিহাস</CardTitle>
                                <CardDescription className="font-bengali">সর্বশেষ ১০০টি ভর্তি ও মাসিক ফি পেমেন্টের তালিকা এবং রশিদ ডাউনলোড করুন।</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StudentPaymentHistory history={history} settings={settings} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="structure">
                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader>
                                <CardTitle className="font-bengali">একাডেমিক ফি স্ট্রাকচার</CardTitle>
                                <CardDescription className="font-bengali">
                                    প্রতিটি কোর্স, বিভাগ এবং ব্যাচের জন্য ফি নির্ধারণ করুন।
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FeeStructureTable />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="plans">
                        <FeePlansManager />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
