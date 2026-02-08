import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDonorById, getDonationsByDonorId } from "@/lib/actions/donation-actions";
import { getSiteSettings } from "@/lib/actions/settings-actions";
import { ArrowLeft, Phone, MapPin, User, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DonationReceipt } from "@/components/admin/donations/DonationReceipt";

export default async function DonorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Explicitly await the promise to get the ID, then fetch data
    const donor = await getDonorById(id);
    const donations = await getDonationsByDonorId(id);
    const settings = await getSiteSettings();

    if (!donor) {
        notFound();
    }

    const totalDonated = donations.reduce((sum: number, d: any) => sum + d.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/donations">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold font-bengali text-blue-600">দাতা প্রোফাইল</h1>
                    <p className="text-sm text-zinc-500">Donor Profile & History</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Donor Info Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="font-bengali text-lg">ব্যক্তিগত তথ্য</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-teal-100 p-3 rounded-full">
                                <User className="w-5 h-5 text-teal-700" />
                            </div>
                            <div>
                                <p className="font-bold">{donor.name}</p>
                                <Badge variant="outline" className="mt-1">{donor.type}</Badge>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-zinc-400" />
                                <span>{donor.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-zinc-400" />
                                <span>{donor.address || "Address not set"}</span>
                            </div>
                            {donor.committee && (
                                <div className="bg-purple-50 p-3 rounded text-sm border border-purple-100 mt-2">
                                    <span className="font-semibold text-purple-700 block mb-1">কমিটি:</span>
                                    {donor.committee}
                                </div>
                            )}
                            {donor.fixedAmount && donor.fixedAmount > 0 && (
                                <div className="bg-green-50 p-3 rounded text-sm border border-green-100 mt-2">
                                    <span className="font-semibold text-green-700 block mb-1">মাসিক প্রতিশ্রুতি:</span>
                                    ৳{donor.fixedAmount}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Donation History Card */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-bengali text-lg">দান ইতিহাস</CardTitle>
                        <div className="text-right">
                            <p className="text-sm text-zinc-500 font-bengali">মোট দান</p>
                            <p className="text-2xl font-bold text-teal-600">৳{totalDonated}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bengali">তারিখ</TableHead>
                                    <TableHead className="font-bengali">উদ্দেশ্য</TableHead>
                                    <TableHead className="font-bengali">নোট</TableHead>
                                    <TableHead className="font-bengali text-right">পরিমাণ</TableHead>
                                    <TableHead className="font-bengali text-right">রশিদ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-zinc-500 font-bengali">
                                            কোন রেকর্ড পাওয়া যায়নি
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    donations.map((d: any) => (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-mono text-xs text-zinc-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(d.date).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium font-bengali">{d.purpose}</TableCell>
                                            <TableCell className="text-xs text-zinc-500 max-w-[150px] truncate">{d.notes || "-"}</TableCell>
                                            <TableCell className="text-right font-bold font-mono">৳{d.amount}</TableCell>
                                            <TableCell className="text-right">
                                                <DonationReceipt donation={d} donor={donor} settings={settings} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
