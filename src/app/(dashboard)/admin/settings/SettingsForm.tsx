"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteSettings } from "@/lib/actions/settings-actions";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface SettingsData {
    madrasaName: string;
    madrasaAddress?: string | null;
    madrasaLogo?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
}

export default function SettingsForm({ initialData }: { initialData: SettingsData | null }) {
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(initialData?.madrasaLogo || "");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            madrasaName: formData.get("madrasaName") as string,
            madrasaAddress: formData.get("madrasaAddress") as string,
            madrasaLogo: logoUrl,
            contactEmail: formData.get("contactEmail") as string,
            contactPhone: formData.get("contactPhone") as string,
            siteActive: true,
        };

        try {
            await updateSiteSettings(data);
            toast.success("সেটিংস আপডেট হয়েছে");
        } catch (err) {
            toast.error("আপডেট করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                <CardHeader>
                    <CardTitle>প্রতিষ্ঠানের তথ্য</CardTitle>
                    <CardDescription>রিপোর্ট এবং ইনভয়েসের জন্য এটি ব্যবহার করা হবে।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <Label>মাদ্রাসার লোগো</Label>
                        <div className="flex items-center gap-4">
                            {logoUrl && (
                                <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                                    <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setLogoUrl("")}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <CldUploadWidget
                                signatureEndpoint="/api/sign-cloudinary-params"
                                options={{
                                    sources: ['local', 'url'],
                                    maxFiles: 1
                                }}
                                onSuccess={(result: any) => {
                                    setLogoUrl(result?.info?.secure_url);
                                }}
                            >
                                {({ open }) => (
                                    <Button type="button" variant="outline" onClick={() => open()} className="gap-2">
                                        <ImagePlus size={16} />
                                        লোগো আপলোড করুন
                                    </Button>
                                )}
                            </CldUploadWidget>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="madrasaName">মাদ্রাসার নাম (বাংলা/ইংরেজি)</Label>
                        <Input id="madrasaName" name="madrasaName" defaultValue={initialData?.madrasaName} placeholder="ইন্টারনেট মাদ্রাসা" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="madrasaAddress">ঠিকানা</Label>
                        <Input id="madrasaAddress" name="madrasaAddress" defaultValue={initialData?.madrasaAddress || ""} placeholder="ঢাকা, বাংলাদেশ" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">অফিসিয়াল ইমেইল</Label>
                            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={initialData?.contactEmail || ""} placeholder="admin@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">ফোন / হোয়াটসঅ্যাপ</Label>
                            <Input id="contactPhone" name="contactPhone" defaultValue={initialData?.contactPhone || ""} placeholder="+8801..." />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8" disabled={loading}>
                            {loading ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    
}
