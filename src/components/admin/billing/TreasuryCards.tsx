"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, TrendingUp, AlertCircle } from "lucide-react";

export function TreasuryCards({ stats, viewMode = "ONLINE" }: { stats: any, viewMode?: string }) {
    const findFund = (type: string) => stats.fundBreakdown.find((f: any) => f.fundType === type)?.amount || 0;
    const isOffline = viewMode === "OFFLINE";

    const funds = [
        {
            name: isOffline ? "অফলাইন মাসিক ফি" : "অনলাইন মাসিক ফি",
            amount: `৳${findFund("MONTHLY")}`,
            icon: Wallet,
            color: "text-teal-600"
        },
        // Removed Admission and Donation (Lillah) as requested
        {
            name: "দানা কমিটি",
            amount: `৳${findFund("DANA_COMMITTEE")}`,
            icon: AlertCircle,
            color: "text-amber-600"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {funds.map((fund) => (
                <Card key={fund.name} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500 font-bengali">{fund.name}</CardTitle>
                        <fund.icon className={`h-4 w-4 ${fund.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{fund.amount}</div>
                        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                            <span className="text-green-600 font-medium">Synced</span> just now
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
