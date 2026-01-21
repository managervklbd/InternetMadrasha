
import { getInvoiceById } from "@/lib/actions/billing-actions";
import { getSiteSettings } from "@/lib/actions/settings-actions";
import { notFound } from "next/navigation";
import { InvoicePrintButton } from "@/components/invoice/InvoicePrintButton";
import { CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

export default async function InvoicePage({ params }: { params: { id: string } }) {
    const invoice = await getInvoiceById(params.id);
    const settings = await getSiteSettings();

    if (!invoice) {
        notFound();
    }

    const brandName = settings?.madrasaName || "তালিমুল কুরআন ওয়াস-সুন্নাহ ইন্টারনেট মাদ্রাসা";
    const brandAddress = settings?.madrasaAddress || "অফিসিয়াল ইনভয়েস";
    const brandLogo = settings?.madrasaLogo || "/logo.png";

    const student = invoice.student;
    // Determine academic info from enrollments or direct assignment
    const enrollment = student.enrollments[0];
    const batch = enrollment?.batch;
    const dept = batch?.department || student.department;
    const course = dept?.course; // Assuming simple relation or infer from debt

    // Date formatting (Bengali if possible or English)
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-GB"); // dd/mm/yyyy
    };

    // Amount formatting
    const formatMoney = (amount: number) => `৳${amount}`;

    return (
        <div className="min-h-screen bg-zinc-100 p-8 print:p-0 print:bg-white print:block print:h-auto print:min-h-0 print:overflow-hidden flex justify-center print:flex-none">
            {/* Print Controls - Hidden when printing */}
            <div className="fixed top-4 right-4 print:hidden flex gap-2">
                <InvoicePrintButton />
            </div>

            {/* Invoice Container - A4 Width Approx 210mm ~ 794px */}
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none print:w-full print:min-h-0 print:h-auto p-0 flex flex-col font-sans invoice-container">

                {/* 1. Header Section - Green Background */}
                <div className="bg-[#0f5132] text-white p-8 print:p-4 mb-6 print:mb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            {/* Logo - From Settings */}
                            <div className="w-16 h-16 relative bg-white/10 rounded-lg overflow-hidden">
                                <Image
                                    src={brandLogo}
                                    alt="Logo"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-bengali">{brandName}</h1>
                                <p className="text-xs opacity-80 mt-1 font-bengali whitespace-pre-line">{brandAddress}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold uppercase tracking-widest opacity-90">INVOICE</h3>
                            <p className="text-sm font-mono mt-1 opacity-70">ID: {invoice.id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Info Grid */}
                <div className="px-10 print:px-4 py-2">
                    <div className="flex justify-between border-b pb-4 mb-4 border-zinc-200">
                        {/* Student/Recipient */}
                        <div>
                            <p className="text-xs text-zinc-500 mb-1 font-bengali">প্রাপক</p>
                            <h2 className="text-xl font-bold font-bengali text-zinc-900">{student.fullName}</h2>
                            <p className="text-sm text-zinc-600 font-mono mt-0.5">ছাত্র ID: <span className="font-bold">{student.studentID}</span></p>
                            <p className="text-sm text-zinc-500 mt-0.5">{student.user?.email}</p>
                            <p className="text-sm text-zinc-500 mt-0.5">{student.phoneNumber}</p>
                        </div>

                        {/* Invoice Meta */}
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 mb-1 font-bengali">ইনভয়েস বিবরণ</p>
                            <div className="space-y-1">
                                <p className="text-sm text-zinc-700 font-bold font-bengali">
                                    প্রদান: <span className="font-mono font-normal">{formatDate(invoice.issuedAt)}</span>
                                </p>
                                <p className="text-sm text-zinc-700 font-bold font-bengali">
                                    মাস: <span className="font-mono font-normal">{invoice.month}/{invoice.year}</span>
                                </p>
                                <div className="mt-2 flex justify-end">
                                    <span className={`px-4 py-1 text-xs font-bold uppercase tracking-wider border ${invoice.status === 'PAID'
                                        ? 'border-green-600 text-green-700 bg-green-50'
                                        : 'border-red-600 text-red-700 bg-red-50'
                                        }`}>
                                        {invoice.status === 'PAID' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Info Grid */}
                    <div className="grid grid-cols-3 gap-8 print:gap-4 py-6 print:py-2 mb-4 print:mb-2">
                        <div>
                            <p className="text-xs text-zinc-500 font-bengali mb-1">কোর্স</p>
                            <p className="font-bold font-bengali text-zinc-800 border-b border-zinc-200 pb-1">
                                {course?.name || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bengali mb-1">বিভাগ</p>
                            <p className="font-bold font-bengali text-zinc-800 border-b border-zinc-200 pb-1">
                                {dept?.name || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bengali mb-1">ব্যাচ/সেমিস্টার</p>
                            <p className="font-bold font-bengali text-zinc-800 border-b border-zinc-200 pb-1">
                                {batch?.name || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Fee Summary Table */}
                <div className="px-10 print:px-4 flex-1">
                    <p className="text-xs text-zinc-500 font-bengali mb-3">ফি এর সারসংক্ষেপ</p>
                    <table className="w-full text-left mb-6">
                        <thead>
                            <tr className="border-b-2 border-zinc-800">
                                <th className="py-2 text-sm font-bold text-zinc-800 font-bengali w-3/4">বিবরণ</th>
                                <th className="py-2 text-sm font-bold text-zinc-800 font-bengali text-right">পরিমান</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-zinc-200">
                                <td className="py-4 text-sm font-bold font-bengali text-zinc-800">
                                    {invoice.plan ? invoice.plan.name : "মাসিক টিউশন ফি"} ({invoice.month}/{invoice.year})
                                </td>
                                <td className="py-4 text-sm font-bold font-mono text-zinc-800 text-right">
                                    {formatMoney(invoice.amount)}
                                </td>
                            </tr>
                            {/* Empty rows to fill space if needed, or just total */}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="pt-4 text-right pr-8 text-sm font-bold font-bengali text-zinc-600">মোট পরিমান</td>
                                <td className="pt-4 text-xl font-bold font-mono text-teal-700 text-right">
                                    {formatMoney(invoice.amount)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* 4. Payment Receipt Box */}
                    {invoice.status === 'PAID' && (
                        <div className="mt-8 border border-green-200 bg-green-50 p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 flex items-center justify-center text-green-600 rounded-none border border-green-200">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold font-bengali text-green-800">পরিশোধিত পেমেন্ট</p>
                                <p className="text-[10px] uppercase text-green-600 font-mono mt-1">
                                    ট্রানজেকশন আইডি: {invoice.transactions?.[0]?.tranId || "MANUAL_ENTRY"}
                                </p>
                                <p className="text-[10px] text-green-600 font-mono">
                                    ({invoice.transactions?.[0]?.cardType || "CASH/MANUAL"})
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-400 font-bengali">পরিশোধের তারিখ</p>
                                <p className="text-xs font-mono text-zinc-600">
                                    {invoice.transactions?.[0]?.tranDate
                                        ? new Date(invoice.transactions[0].tranDate).toLocaleString("en-GB")
                                        : "N/A"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. Footer */}
                <div className="mt-auto p-10 print:p-4 text-center border-t border-zinc-100">
                    <p className="text-[10px] text-zinc-400 font-bengali mb-1">
                        {brandName}-এর সাথে যুক্ত থাকার জন্য ধন্যবাদ
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                        {settings?.contactEmail || "info@internetmadrasha.com"}
                    </p>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: white;
                        margin: 0;
                        padding: 0;
                    }
                    /* Target the specific container and ensure it fits */
                    .invoice-container {
                        box-shadow: none;
                        width: 100%;
                        max-width: 100%;
                        height: auto;
                        min-height: auto;
                        overflow: hidden;
                        border: none;
                        margin: 0;
                        padding: 0;
                        page-break-after: avoid;
                        page-break-before: avoid;
                    }
                }
            `}} />
        </div>
    );
}
