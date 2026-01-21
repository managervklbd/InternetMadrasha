"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

export function StudentPaymentReceipt({ transaction, settings }: { transaction: any, settings: any }) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Receipt-${transaction.invoice?.invoiceNo || transaction.id}`,
    });

    const student = transaction.invoice?.student;

    return (
        <div>
            <button
                onClick={() => handlePrint()}
                className="inline-flex items-center gap-1 text-[10px] font-bengali bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded border transition-colors"
            >
                রশিদ
            </button>

            <div className="hidden">
                <div ref={componentRef} className="p-8 bg-white text-black" style={{ width: "210mm", minHeight: "297mm", fontFamily: "Arial, sans-serif" }}>
                    {/* Header */}
                    <div className="text-center border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold font-bengali text-blue-800">{settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"}</h1>
                        <p className="text-sm text-gray-600 mt-1">ঠিকানা: {settings?.madrasaAddress || "ঢাকা, বাংলাদেশ"} | ফোন: {settings?.contactPhone || "017XXXXXXXX"}</p>
                        <h2 className="text-xl font-bold mt-4 border px-4 py-1 inline-block rounded-md border-black font-bengali">অর্থ প্রাপ্তি রশিদ</h2>
                    </div>

                    {/* Receipt Details */}
                    <div className="flex justify-between mb-6 text-sm">
                        <div>
                            <p><strong>রশিদ নং:</strong> {transaction.invoice?.invoiceNo || transaction.referenceId || "N/A"}</p>
                            <p><strong>তারিখ:</strong> {new Date(transaction.transactionDate).toLocaleDateString("bn-BD")}</p>
                        </div>
                        <div className="text-right">
                            <p><strong>সময়:</strong> {new Date(transaction.transactionDate).toLocaleTimeString("bn-BD")}</p>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="border rounded p-4 mb-6 bg-gray-50">
                        <table className="w-full text-left font-bengali">
                            <tbody>
                                <tr>
                                    <td className="py-1 w-32 font-semibold">শিক্ষার্থীর নাম:</td>
                                    <td>{student?.fullName || "Unknown"}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">শিক্ষার্থী আইডি:</td>
                                    <td>{student?.studentID || "N/A"}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">মারহালা:</td>
                                    <td>{student?.department?.course?.name || "N/A"}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">বিভাগ:</td>
                                    <td>{student?.department?.name || "N/A"}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">মোবাইল:</td>
                                    <td>{student?.phoneNumber || "N/A"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Table */}
                    <table className="w-full border-collapse border border-gray-300 mb-6 font-bengali">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left">বিবরণ</th>
                                <th className="border border-gray-300 p-2 text-right w-32">টাকা</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 p-2">
                                    <p className="font-semibold">
                                        {transaction.fundType === "MONTHLY" ? "মাসিক ফি" : transaction.fundType === "ADMISSION" ? "ভর্তি ফি" : transaction.fundType}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {transaction.description || transaction.invoice?.plan?.name || "Payment for academic services"}
                                    </p>
                                </td>
                                <td className="border border-gray-300 p-2 text-right font-bold text-lg">
                                    ৳{transaction.amount}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12 font-bengali">
                        <div className="w-64 border rounded p-4">
                            <div className="flex justify-between font-bold text-lg text-teal-700">
                                <span>সর্বমোট:</span>
                                <span>৳{transaction.amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 flex justify-between items-end pt-8 font-bengali text-sm text-gray-600">
                        <div className="text-center">
                            <p className="border-t border-gray-400 px-8 pt-1">হিসাব রক্ষক</p>
                        </div>
                        <div className="text-center">
                            <p className="border-t border-gray-400 px-8 pt-1">কর্তৃপক্ষের স্বাক্ষর</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-xs text-gray-400 flex flex-col gap-1">
                        <p>এটি একটি কম্পিউটার জেনারেটেড রশিদ। এতে কোনো স্বাক্ষরের প্রয়োজন নেই।</p>
                        <p>Powered by Internet Madrasa Management System</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
