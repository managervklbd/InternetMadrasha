"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

export function DonationReceipt({ donation, donor, settings }: { donation: any, donor: any, settings: any }) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Receipt-${donation.receiptNo || donation.id}`,
    });

    return (
        <div>
            <Button size="sm" variant="outline" className="h-8 gap-2 font-bengali" onClick={() => handlePrint()}>
                <Printer className="w-3.5 h-3.5" />
                রশিদ
            </Button>

            <div className="hidden">
                <div ref={componentRef} className="p-8 bg-white text-black" style={{ width: "210mm", minHeight: "297mm", fontFamily: "Arial, sans-serif" }}>
                    {/* Header */}
                    <div className="text-center border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold font-bengali text-teal-800">{settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"}</h1>
                        <p className="text-sm text-gray-600 mt-1">ঠিকানা: {settings?.madrasaAddress || "ঢাকা, বাংলাদেশ"} | ফোন: {settings?.contactPhone || "017XXXXXXXX"}</p>
                        <h2 className="text-xl font-bold mt-4 border px-4 py-1 inline-block rounded-md border-black">দান রশিদ</h2>
                    </div>

                    {/* Receipt Details */}
                    <div className="flex justify-between mb-6 text-sm">
                        <div>
                            <p><strong>রশিদ নং:</strong> {donation.receiptNo || donation.id.slice(0, 8).toUpperCase()}</p>
                            <p><strong>তারিখ:</strong> {new Date(donation.date).toLocaleDateString("bn-BD")}</p>
                        </div>
                        <div className="text-right">
                            <p><strong>সময়:</strong> {new Date(donation.date).toLocaleTimeString("bn-BD")}</p>
                        </div>
                    </div>

                    {/* Donor Info */}
                    <div className="border rounded p-4 mb-6 bg-gray-50">
                        <table className="w-full text-left">
                            <tbody>
                                <tr>
                                    <td className="py-1 w-32 font-semibold">দাতার নাম:</td>
                                    <td>{donor.name}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">মোবাইল:</td>
                                    <td>{donor.phone || "N/A"}</td>
                                </tr>
                                {donor.committee && (
                                    <tr>
                                        <td className="py-1 font-semibold">কমিটি:</td>
                                        <td>{donor.committee}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Amount Table */}
                    <table className="w-full border-collapse border border-gray-300 mb-6">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left">বিবরণ</th>
                                <th className="border border-gray-300 p-2 text-right w-32">টাকা</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 p-2">
                                    <p className="font-semibold">{donation.purpose}</p>
                                    {donation.notes && <p className="text-xs text-gray-500 mt-1">{donation.notes}</p>}
                                </td>
                                <td className="border border-gray-300 p-2 text-right font-bold text-lg">
                                    ৳{donation.amount}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="mt-12 flex justify-between items-end pt-8">
                        <div className="text-center">
                            <p className="border-t border-gray-400 px-8 pt-1 text-sm">আদায়কারীর স্বাক্ষর</p>
                        </div>
                        <div className="text-center">
                            <p className="border-t border-gray-400 px-8 pt-1 text-sm">কর্তৃপক্ষের স্বাক্ষর</p>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-400">
                        <p>This is a computer generated receipt.</p>
                        <p>Powered by Internet Madrasa System</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
