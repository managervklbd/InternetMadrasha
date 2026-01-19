"use client";

import { useState } from "react";
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
    CreditCard,
    Wallet,
    TrendingUp,
    FileText,
    ArrowUpRight,
    Download,
    AlertCircle,
    Loader2
} from "lucide-react";

import { FeePlansManager } from "@/components/admin/billing/FeePlansManager";
import { FeeStructureTable } from "@/components/admin/billing/FeeStructureTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMonthlyInvoices } from "@/lib/actions/billing-actions";
import { useToast } from "@/hooks/use-toast";

export default function BillingPage() {
    const { toast } = useToast();
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await generateMonthlyInvoices();
            if (res.success) {
                toast({ title: "সফল", description: `${res.count} টি চালান তৈরি করা হয়েছে` });
            } else {
                toast({ variant: "destructive", title: "ব্যর্থ", description: "চালান তৈরি করতে ব্যর্থ" });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "ত্রুটি", description: "চালান তৈরি করতে সমস্যা হয়েছে" });
        } finally {
            setGenerating(false);
        }
    };

    const funds = [
        { name: "Monthly Fee Fund", amount: "৳45,200", icon: Wallet, color: "teal" },
        { name: "Admission Fund", amount: "৳12,000", icon: CreditCard, color: "blue" },
        { name: "Donations (Lillah)", amount: "৳8,500", icon: TrendingUp, color: "green" },
        { name: "Dana Committee", amount: "৳3,200", icon: AlertCircle, color: "amber" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Treasury</h1>
                    <p className="text-zinc-500 text-lg">Monitor all funds, manage monthly billing, and reconcile payments.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 h-11">
                        <Download className="w-4 h-4" />
                        Export Monthly Report
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="gap-2 bg-teal-600 hover:bg-teal-700 h-11 px-6 font-bengali"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                        মাসিক ইনভয়েস জেনারেট করুন
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {funds.map((fund) => (
                    <Card key={fund.name} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-zinc-500">{fund.name}</CardTitle>
                            <fund.icon className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fund.amount}</div>
                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                <span className="text-green-600 font-medium">Synced</span> just now
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-8">
                <Tabs defaultValue="structure" className="space-y-6">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1">
                        <TabsTrigger value="overview" className="font-bengali">ওভারভিউ</TabsTrigger>
                        <TabsTrigger value="structure" className="font-bengali">ফি স্ট্রাকচার (কোর্স ফি)</TabsTrigger>
                        <TabsTrigger value="plans" className="font-bengali">কাস্টম প্ল্যান</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader>
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <CardDescription>Consolidated ledger of all income streams across funds.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Fund Type</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-sm text-zinc-500 italic text-center py-12" colSpan={5}>
                                                    Historical ledger data will be populated once live transactions are processed.
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader>
                                    <CardTitle>Fee Collection Analytics</CardTitle>
                                    <CardDescription>Overview of this month&apos;s collection status.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Targets Met</span>
                                            <span className="font-bold">65%</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-600 w-[65%]" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500">Collected</span>
                                            <span className="font-semibold">৳28,400</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500">Pending</span>
                                            <span className="font-semibold">৳15,200</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500">Total Projected</span>
                                            <span className="font-bold text-teal-600">৳43,600</span>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full mt-4 gap-2">
                                        Re-scan Invoice Status
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="structure">
                        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader>
                                <CardTitle className="font-bengali">একাডেমিক ফি স্ট্রাকচার</CardTitle>
                                <CardDescription className="font-bengali">
                                    এখানে প্রতিটি কোর্স, বিভাগ এবং ব্যাচের জন্য রেগুলার এবং সাদকা (স্কলারশিপ) ফি নির্ধারণ করুন।
                                    শিক্ষার্থী ভর্তির সময় এই ফি অটোমেটিক সেট হবে।
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
