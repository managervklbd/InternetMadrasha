import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "./PrintButton";
import { getSiteSettings } from "@/lib/actions/settings-actions";

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const settings = await getSiteSettings();

    const invoice = await prisma.monthlyInvoice.findUnique({
        where: { id: params.id },
        include: {
            student: {
                include: {
                    user: true,
                    department: { include: { course: true } },
                    enrollments: { include: { batch: true }, take: 1 }
                }
            },
            transactions: {
                where: { status: "VALIDATED" },
                orderBy: { tranDate: "desc" },
                take: 1
            }
        }
    });

    if (!invoice) notFound();

    // Security check: Only the student or an admin can view this
    if (session.user.role === "STUDENT" && invoice.student.userId !== session.user.id) {
        return <div className="p-8 text-center text-red-600 font-bold">Unauthorized Access</div>;
    }

    const student = invoice.student;
    const enrollment = student.enrollments[0];
    const transaction = invoice.transactions[0];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 print:p-0 print:bg-white">
            {/* Control Bar - Hidden on Print */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href="/student/billing">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        ফিরে যান
                    </Button>
                </Link>
                <PrintButton />
            </div>

            {/* The Invoice Card */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 shadow-xl rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 print:max-w-none print:w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-900 to-emerald-800 p-8 text-white relative">
                    <div className="relative z-10 flex flex-col md:flex-row print:flex-row justify-between items-start md:items-center print:items-center gap-6">
                        <div className="flex items-center gap-4">
                            {settings?.madrasaLogo && (
                                <img src={settings.madrasaLogo} alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-white/10 p-2" />
                            )}
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight mb-1 font-bengali">{settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"}</h1>
                                <p className="text-teal-100 font-medium font-bengali">অফিসিয়াল ইনভয়েস</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold opacity-80 uppercase tracking-widest font-bengali">ইনভয়েস</h2>
                            <p className="font-mono text-sm opacity-60">ID: {invoice.id.slice(-12).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 print:p-6 space-y-10 print:space-y-6">
                    {/* Student & Invoice Status Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-bengali">প্রাপক</h3>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-bengali">{student.fullName}</p>
                                <p className="text-zinc-500 font-medium">ছাত্র ID: {student.studentID}</p>
                                <p className="text-zinc-500">{student.user.email}</p>
                                <p className="text-zinc-500">{student.phoneNumber}</p>
                            </div>
                        </section>
                        <section className="space-y-4 md:text-right print:text-right">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-bengali">ইনভয়েস বিবরণ</h3>
                            <div className="space-y-1">
                                <p className="text-zinc-600 dark:text-zinc-400 font-bengali"><strong>প্রদান:</strong> {new Date(invoice.issuedAt).toLocaleDateString()}</p>
                                <p className="text-zinc-600 dark:text-zinc-400 font-bengali"><strong>মাস:</strong> {invoice.month}/{invoice.year}</p>
                                <div className="pt-2">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border font-bengali ${invoice.status === 'PAID'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        {invoice.status === 'PAID' ? 'পরিশোধিত' : 'বকেয়া'}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Academic Context */}
                    <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 py-6 print:py-4 border-y border-zinc-100 dark:border-zinc-800">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase font-bengali">কোর্স</p>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300 font-bengali">{student.department?.course?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase font-bengali">বিভাগ</p>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300 font-bengali">{student.department?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase font-bengali">ব্যাচ/সেমিস্টার</p>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300 font-bengali">{enrollment?.batch?.name || "N/A"}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <section>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 font-bengali">ফি এর সারসংক্ষেপ</h3>
                        <table className="w-full">
                            <thead className="border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="text-left py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 font-bengali">বিবরণ</th>
                                    <th className="text-right py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 font-bengali">পরিমান</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                                <tr>
                                    <td className="py-4 text-zinc-700 dark:text-zinc-300 font-medium font-bengali">মাসিক টিউশন ফি ({invoice.month}/{invoice.year})</td>
                                    <td className="py-4 text-right text-zinc-800 dark:text-zinc-200 font-bold">৳{invoice.amount}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-zinc-900 dark:border-zinc-100">
                                    <td className="py-6 text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-tighter text-right pr-4 font-bengali">মোট পরিমান</td>
                                    <td className="py-6 text-2xl font-black text-teal-700 dark:text-teal-400 text-right">৳{invoice.amount}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </section>

                    {/* Multi-level verification / Payment Info */}
                    {invoice.status === "PAID" && (
                        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 print:p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row print:flex-row items-center gap-6">
                            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm border border-green-100">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex-1 text-center md:text-left print:text-left">
                                <h4 className="font-bold text-green-700 mb-1 leading-tight font-bengali">পরিশোধিত পেমেন্ট</h4>
                                <p className="text-xs text-zinc-500 font-bengali">
                                    {transaction
                                        ? `ট্রানজেকশন আইডি: ${transaction.tranId} (${transaction.cardType})`
                                        : "আমাদের সুরক্ষিত পেমেন্ট গেটওয়ের মাধ্যমে সফলভাবে সম্পন্ন হয়েছে।"}
                                </p>
                            </div>
                            <div className="text-right font-mono text-[10px] text-zinc-400 font-bengali">
                                পরিশোধের তারিখ: {transaction ? new Date(transaction.tranDate).toLocaleString('bn-BD') : new Date().toLocaleString('bn-BD')}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-12 print:pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center space-y-4 print:space-y-2">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-bengali">{settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"}-এর সাথে যুক্ত থাকার জন্য ধন্যবাদ</p>
                        <div className="flex justify-center gap-8 text-[11px] text-zinc-500 font-medium">
                            <p>{settings?.contactEmail || "info@internetmadrasha.com"}</p>
                            <p>{settings?.contactPhone}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        margin: 0.5cm;
                        size: A4;
                    }
                    body { 
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print\\:hidden { display: none !important; }
                    
                    /* Force full width and remove all web-only spacing/shadows */
                    .max-w-4xl {
                        max-width: none !important;
                        width: 100% !important;
                        margin: 0 !important;
                    }
                }
            `}} />
        </div>
    );
}
