"use client";

import { useState, useEffect } from "react";
import { getProfitLossStatement } from "@/lib/actions/report-actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    TrendingUp,
    TrendingDown,
    PieChart,
    Download,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const FUND_TYPE_LABELS: Record<string, string> = {
    // Income
    ADMISSION: "ভর্তি ফি (Admission Fee)",
    MONTHLY: "মাসিক ফি (Monthly Fee)",
    TUITION_FEE: "টিউশন ফি",
    DONATION: "দান (Donation)",
    DANA_COMMITTEE: "কমিটি দান",
    ZAKAT: "যাকাত",
    SADAQAH: "সাদাকাহ",
    OTHER_INCOME: "অন্যান্য আয়",
    // Expenses
    TEACHER_SALARY: "শিক্ষক বেতন",
    UTILITY_EXPENSE: "ইউটিলিটি খরচ",
    RENT_EXPENSE: "ভাড়া খরচ",
    MAINTENANCE_EXPENSE: "রক্ষণাবেক্ষণ খরচ",
    OFFICE_EXPENSE: "অফিস খরচ",
    TRANSPORT_EXPENSE: "পরিবহন খরচ",
    MARKETING_EXPENSE: "মার্কেটিং খরচ",
    OTHER_EXPENSE: "অন্যান্য খরচ",
};

export default function ProfitLossPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const statement = await getProfitLossStatement(
                new Date(dateRange.startDate),
                new Date(dateRange.endDate)
            );
            setData(statement);
        } catch (error) {
            toast.error("রিপোর্ট লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilter = () => {
        fetchData();
    };

    if (loading && !data) {
        return <div className="p-8 text-center font-bengali">লোড হচ্ছে...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-bengali">লাভ-ক্ষতি বিবরণী (Profit & Loss)</h1>
                    <p className="text-zinc-500 text-lg font-bengali">মাদ্রাসার আয় ও ব্যয়ের বিস্তারিত বিবরণ।</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 font-bengali">
                        <Download className="w-4 h-4" />
                        রিপোর্ট ডাউনলোড
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                <CardContent className="pt-6">
                    <div className="flex items-end gap-4">
                        <div className="space-y-2">
                            <Label className="font-bengali">শুরু তারিখ</Label>
                            <Input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="w-48"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bengali">শেষ তারিখ</Label>
                            <Input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="w-48"
                            />
                        </div>
                        <Button onClick={handleFilter} className="bg-teal-600 hover:bg-teal-700 font-bengali">
                            ফিল্টার করুন
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 bg-emerald-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-emerald-700">
                        <CardTitle className="text-sm font-medium font-bengali">মোট আয় (Income)</CardTitle>
                        <ArrowUpCircle className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">৳ {data?.totalIncome.toLocaleString("bn-BD")}</div>
                        <p className="text-xs text-emerald-600 font-bengali">নির্বাচিত সময়কালে</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-zinc-200 bg-red-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-red-700">
                        <CardTitle className="text-sm font-medium font-bengali">মোট ব্যয় (Expenses)</CardTitle>
                        <ArrowDownCircle className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">৳ {data?.totalExpenses.toLocaleString("bn-BD")}</div>
                        <p className="text-xs text-red-600 font-bengali">নির্বাচিত সময়কালে</p>
                    </CardContent>
                </Card>
                <Card className={`border-none shadow-sm ring-1 ring-zinc-200 ${data?.netProfit >= 0 ? 'bg-blue-50/50' : 'bg-amber-50/50'}`}>
                    <CardHeader className={`flex flex-row items-center justify-between pb-2 space-y-0 ${data?.netProfit >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                        <CardTitle className="text-sm font-medium font-bengali">নিট লাভ/ক্ষতি (Net P/L)</CardTitle>
                        <Wallet className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data?.netProfit >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                            ৳ {Math.abs(data?.netProfit).toLocaleString("bn-BD")}
                            {data?.netProfit < 0 && <span className="text-sm ml-1">(ক্ষতি)</span>}
                        </div>
                        <p className={`text-xs ${data?.netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'} font-bengali`}>আয় - ব্যয়</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Income Table */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                    <CardHeader className="bg-emerald-50/30 border-b">
                        <CardTitle className="text-emerald-800 font-bengali flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            আয়ের বিবরণ (Income Details)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50">
                                <TableRow>
                                    <TableHead className="font-bengali">খাত (Category)</TableHead>
                                    <TableHead className="text-right font-bengali">পরিমাণ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.income.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-8 text-zinc-500 font-bengali">কোনো আয়ের রেকর্ড নেই</TableCell>
                                    </TableRow>
                                ) : (
                                    data?.income.map((item: any) => (
                                        <TableRow key={item.fundType}>
                                            <TableCell className="font-bengali">{FUND_TYPE_LABELS[item.fundType] || item.fundType}</TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">৳ {item.amount.toLocaleString("bn-BD")}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                <TableRow className="bg-zinc-50 border-t-2">
                                    <TableCell className="font-bold font-bengali">মোট আয়</TableCell>
                                    <TableCell className="text-right font-bold text-emerald-700">৳ {data?.totalIncome.toLocaleString("bn-BD")}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Expense Table */}
                <Card className="border-none shadow-sm ring-1 ring-zinc-200">
                    <CardHeader className="bg-red-50/30 border-b">
                        <CardTitle className="text-red-800 font-bengali flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            ব্যয়ের বিবরণ (Expense Details)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50">
                                <TableRow>
                                    <TableHead className="font-bengali">খাত (Category)</TableHead>
                                    <TableHead className="text-right font-bengali">পরিমাণ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.expenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-8 text-zinc-500 font-bengali">কোনো ব্যয়ের রেকর্ড নেই</TableCell>
                                    </TableRow>
                                ) : (
                                    data?.expenses.map((item: any) => (
                                        <TableRow key={item.fundType}>
                                            <TableCell className="font-bengali">{FUND_TYPE_LABELS[item.fundType] || item.fundType}</TableCell>
                                            <TableCell className="text-right font-bold text-red-600">৳ {item.amount.toLocaleString("bn-BD")}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                <TableRow className="bg-zinc-50 border-t-2">
                                    <TableCell className="font-bold font-bengali">মোট ব্যয়</TableCell>
                                    <TableCell className="text-right font-bold text-red-700">৳ {data?.totalExpenses.toLocaleString("bn-BD")}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-zinc-200 bg-zinc-900 text-white">
                <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold font-bengali">চূড়ান্ত ফলাফল</h3>
                            <p className="text-zinc-400 text-sm font-bengali">এই সময়কালের নিট আর্থিক অবস্থা</p>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-bold ${data?.netProfit >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                ৳ {data?.netProfit.toLocaleString("bn-BD")}
                            </div>
                            <div className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                                {data?.netProfit >= 0 ? "SURPLUS (উদ্বৃত্ত)" : "DEFICIT (ঘাটতি)"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
