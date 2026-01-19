"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    siteActive: boolean;
    // SMTP
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    smtpSecure?: boolean;
    // SSL
    sslStoreId?: string | null;
    sslStorePass?: string | null;
    sslIsSandbox?: boolean;
}

export default function SettingsForm({ initialData }: { initialData: SettingsData | null }) {
    const [loading, setLoading] = useState(false);

    // Controlled State - Initialize safely
    const [formData, setFormData] = useState<SettingsData>({
        madrasaName: initialData?.madrasaName || "ইন্টারনেট মাদ্রাসা",
        madrasaAddress: initialData?.madrasaAddress || "",
        madrasaLogo: initialData?.madrasaLogo || "",
        contactEmail: initialData?.contactEmail || "",
        contactPhone: initialData?.contactPhone || "",
        siteActive: initialData?.siteActive ?? true,

        smtpHost: initialData?.smtpHost || "",
        smtpPort: initialData?.smtpPort || 587,
        smtpUser: initialData?.smtpUser || "",
        smtpPass: initialData?.smtpPass || "",
        smtpSecure: initialData?.smtpSecure ?? false,

        sslStoreId: initialData?.sslStoreId || "",
        sslStorePass: initialData?.sslStorePass || "",
        sslIsSandbox: initialData?.sslIsSandbox ?? true,
    });

    const handleChange = (field: keyof SettingsData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateSiteSettings({
                ...formData,
                // Ensure correct types for optional fields
                smtpPort: formData.smtpPort ? Number(formData.smtpPort) : undefined,
                madrasaAddress: formData.madrasaAddress || undefined,
                madrasaLogo: formData.madrasaLogo || undefined,
                contactEmail: formData.contactEmail || undefined,
                contactPhone: formData.contactPhone || undefined,
                smtpHost: formData.smtpHost || undefined,
                smtpUser: formData.smtpUser || undefined,
                smtpPass: formData.smtpPass || undefined,
                sslStoreId: formData.sslStoreId || undefined,
                sslStorePass: formData.sslStorePass || undefined,
            });
            toast.success("সেটিংস আপডেট হয়েছে");
        } catch (err) {
            console.error(err);
            toast.error("আপডেট করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">সাধারণ তথ্য</TabsTrigger>
                    <TabsTrigger value="smtp">SMTP কনফিগারেশন</TabsTrigger>
                    <TabsTrigger value="ssl">পেমেন্ট গেটওয়ে (SSL)</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>প্রতিষ্ঠানের তথ্য</CardTitle>
                            <CardDescription>রিপোর্ট এবং ইনভয়েসের জন্য এটি ব্যবহার করা হবে।</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label>মাদ্রাসার লোগো</Label>
                                <div className="flex items-center gap-4">
                                    {formData.madrasaLogo && (
                                        <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                                            <Image src={formData.madrasaLogo} alt="Logo" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleChange("madrasaLogo", "")}
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
                                            handleChange("madrasaLogo", result?.info?.secure_url);
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
                                <Input
                                    id="madrasaName"
                                    value={formData.madrasaName}
                                    onChange={(e) => handleChange("madrasaName", e.target.value)}
                                    placeholder="ইন্টারনেট মাদ্রাসা"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="madrasaAddress">ঠিকানা</Label>
                                <Input
                                    id="madrasaAddress"
                                    value={formData.madrasaAddress || ""}
                                    onChange={(e) => handleChange("madrasaAddress", e.target.value)}
                                    placeholder="ঢাকা, বাংলাদেশ"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">অফিসিয়াল ইমেইল</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={formData.contactEmail || ""}
                                        onChange={(e) => handleChange("contactEmail", e.target.value)}
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">ফোন / হোয়াটসঅ্যাপ</Label>
                                    <Input
                                        id="contactPhone"
                                        value={formData.contactPhone || ""}
                                        onChange={(e) => handleChange("contactPhone", e.target.value)}
                                        placeholder="+8801..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SMTP Settings */}
                <TabsContent value="smtp">
                    <Card>
                        <CardHeader>
                            <CardTitle>ইমেইল সার্ভার (SMTP)</CardTitle>
                            <CardDescription>সিস্টেম ইমেইল পাঠানোর জন্য কনফিগারেশন।</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpHost">SMTP Host</Label>
                                    <Input
                                        id="smtpHost"
                                        value={formData.smtpHost || ""}
                                        onChange={(e) => handleChange("smtpHost", e.target.value)}
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort">SMTP Port</Label>
                                    <Input
                                        id="smtpPort"
                                        type="number"
                                        value={formData.smtpPort || ""}
                                        onChange={(e) => handleChange("smtpPort", e.target.value)}
                                        placeholder="587"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpUser">SMTP User / Email</Label>
                                    <Input
                                        id="smtpUser"
                                        value={formData.smtpUser || ""}
                                        onChange={(e) => handleChange("smtpUser", e.target.value)}
                                        placeholder="sender@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPass">SMTP Password</Label>
                                    <Input
                                        id="smtpPass"
                                        type="password"
                                        value={formData.smtpPass || ""}
                                        onChange={(e) => handleChange("smtpPass", e.target.value)}
                                        placeholder="App Password"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="smtpSecure"
                                    checked={formData.smtpSecure || false}
                                    onCheckedChange={(checked) => handleChange("smtpSecure", checked === true)}
                                />
                                <Label htmlFor="smtpSecure">Use Secure Connection (SSL/TLS)</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SSL Commerz Settings */}
                <TabsContent value="ssl">
                    <Card>
                        <CardHeader>
                            <CardTitle>পেমেন্ট গেটওয়ে (SSLCommerz)</CardTitle>
                            <CardDescription>অনলাইন পেমেন্ট গ্রহণের জন্য কনফিগারেশন।</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sslStoreId">Store ID</Label>
                                <Input
                                    id="sslStoreId"
                                    value={formData.sslStoreId || ""}
                                    onChange={(e) => handleChange("sslStoreId", e.target.value)}
                                    placeholder="Store ID provided by SSLCommerz"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sslStorePass">Store Password</Label>
                                <Input
                                    id="sslStorePass"
                                    type="password"
                                    value={formData.sslStorePass || ""}
                                    onChange={(e) => handleChange("sslStorePass", e.target.value)}
                                    placeholder="Store Password"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sslIsSandbox"
                                    checked={formData.sslIsSandbox ?? true}
                                    onCheckedChange={(checked) => handleChange("sslIsSandbox", checked === true)}
                                />
                                <Label htmlFor="sslIsSandbox">Sandbox Mode (Test Mode)</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8" disabled={loading}>
                    {loading ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
            </div>
        </form>
    );
}
