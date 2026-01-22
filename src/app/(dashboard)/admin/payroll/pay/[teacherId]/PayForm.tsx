"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { processTeacherPayment } from "@/lib/actions/payroll-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PaymentMethod } from "@prisma/client";
import { ArrowLeft } from "lucide-react";

type Props = {
    teacherId: string;
    teacherName: string;
    baseSalary: number;
    month: number;
    year: number;
};

export function PayForm({ teacherId, teacherName, baseSalary, month, year }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [bonus, setBonus] = useState("0");
    const [deduction, setDeduction] = useState("0");
    const [note, setNote] = useState("");
    const [method, setMethod] = useState<PaymentMethod>("CASH");

    const total = baseSalary + (parseFloat(bonus) || 0) - (parseFloat(deduction) || 0);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await processTeacherPayment({
                teacherId,
                month,
                year,
                basicSalary: baseSalary,
                bonus: parseFloat(bonus) || 0,
                deduction: parseFloat(deduction) || 0,
                paymentMethod: method,
                note
            });
            toast.success("পেমেন্ট সফল হয়েছে!");
            router.push("/admin/payroll");
        } catch (error: any) {
            toast.error(error.message || "পেমেন্ট ব্যর্থ হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>বেতন প্রদান - {teacherName}</CardTitle>
                <p className="text-sm text-muted-foreground">মাস: {month}/{year}</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg flex justify-between items-center border">
                    <span className="font-medium">মূল বেতন (Base Salary)</span>
                    <span className="text-lg font-bold">৳ {baseSalary.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>বোনাস / অতিরিক্ত (Bonus)</Label>
                        <Input
                            type="number"
                            value={bonus}
                            onChange={(e) => setBonus(e.target.value)}
                            className="bg-green-50/50 border-green-200 focus-visible:ring-green-500"
                        />
                        <p className="text-xs text-muted-foreground">ঈদ বোনাস বা অন্যান্য</p>
                    </div>

                    <div className="space-y-2">
                        <Label>কর্তন (Deduction)</Label>
                        <Input
                            type="number"
                            value={deduction}
                            onChange={(e) => setDeduction(e.target.value)}
                            className="bg-red-50/50 border-red-200 focus-visible:ring-red-500"
                        />
                        <p className="text-xs text-muted-foreground">অনুপস্থিতি বা অগ্রিম বাবদ</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>পেমেন্ট মেথড</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CASH">Cash (নগদ)</SelectItem>
                            <SelectItem value="BANK">Bank Transfer</SelectItem>
                            <SelectItem value="MOBILE_BANKING">Mobile Banking (bKash/Nagad)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>নোট (Note)</Label>
                    <Textarea
                        placeholder="কোনো মন্তব্য থাকলে লিখুন..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                    <span className="text-lg font-bold">সর্বমোট প্রদেয়:</span>
                    <span className="text-2xl font-black text-teal-600">৳ {total.toLocaleString()}</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    ফিরে যান
                </Button>
                <Button onClick={handleSubmit} disabled={loading} size="lg" className="px-8">
                    {loading ? "Confirming..." : "Confirm Payment"}
                </Button>
            </CardFooter>
        </Card>
    );
}
