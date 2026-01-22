
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Printer } from "lucide-react";
import Image from "next/image";
import { getSiteSettings } from "@/lib/actions/settings-actions";
import { PrintButton } from "./PrintButton";

type Props = {
    params: Promise<{ paymentId: string }>;
};

export default async function PayslipPage({ params }: Props) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") return redirect("/");

    const { paymentId } = await params;
    const settings = await getSiteSettings();

    const payment = await prisma.teacherPayment.findUnique({
        where: { id: paymentId },
        include: {
            teacher: true
        }
    });

    if (!payment) return <div>Payment record not found</div>;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold">বেতন স্লিপ (Payslip)</h1>
                <PrintButton />
            </div>

            <Card className="print:shadow-none print:border-none">
                <CardContent className="p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center border-b pb-6 mb-6">
                        {settings?.madrasaLogo && (
                            <div className="relative w-20 h-20 mb-2">
                                <Image
                                    src={settings.madrasaLogo}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}
                        <h2 className="text-2xl font-bold font-bengali">{settings?.madrasaName || "মাদ্রাসা ম্যানেজমেন্ট সিস্টেম"}</h2>
                        <p className="text-muted-foreground text-sm">বেতন রশিদ (Salary Slip)</p>
                        <p className="font-medium mt-1">
                            {monthNames[payment.month - 1]} {payment.year}
                        </p>
                    </div>

                    {/* Teacher Details */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm text-muted-foreground">শিক্ষকের নাম:</p>
                            <p className="font-bold text-lg">{payment.teacher.fullName}</p>
                            <p className="text-sm">{payment.teacher.designation}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">পেমেন্ট তারিখ:</p>
                            <p className="font-medium">{payment.paymentDate.toLocaleDateString('en-GB')}</p>
                            <p className="text-sm text-muted-foreground mt-1">রশিদ নং:</p>
                            <p className="font-mono text-xs">{payment.id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Salary Breakdown Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="text-left py-2">বিবরণ</th>
                                <th className="text-right py-2">টাকা (BDT)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="py-2">মূল বেতন (Basic Salary)</td>
                                <td className="text-right py-2">{payment.basicSalary.toLocaleString()}</td>
                            </tr>
                            {(payment.bonus || 0) > 0 && (
                                <tr>
                                    <td className="py-2 text-green-600">বোনাস / অতিরিক্ত (+)</td>
                                    <td className="text-right py-2 text-green-600">{payment.bonus!.toLocaleString()}</td>
                                </tr>
                            )}
                            {(payment.deduction || 0) > 0 && (
                                <tr>
                                    <td className="py-2 text-red-600">কর্তন (-)</td>
                                    <td className="text-right py-2 text-red-600">{payment.deduction!.toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className="font-bold text-lg border-t-2 border-black">
                                <td className="py-3">সর্বমোট প্রদান</td>
                                <td className="text-right py-3">৳ {payment.amount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Amount in Words (Optional - simpler to just show number for now) */}
                    <div className="mb-12">
                        <p className="text-sm text-muted-foreground">পেমেন্ট মেথড: <span className="font-medium text-foreground">{payment.method}</span></p>
                        {payment.note && <p className="text-sm text-muted-foreground mt-1">নোট: {payment.note}</p>}
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end mt-16 pt-8">
                        <div className="text-center w-40">
                            <div className="border-t border-dashed border-gray-400 pt-2">
                                <p className="text-sm font-medium">হিসাবরক্ষক</p>
                            </div>
                        </div>
                        <div className="text-center w-40">
                            <div className="border-t border-dashed border-gray-400 pt-2">
                                <p className="text-sm font-medium">কর্তৃপক্ষ</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
