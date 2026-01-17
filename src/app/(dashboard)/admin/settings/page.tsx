"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    getSiteSettings,
    updateSiteSettings
} from "@/lib/actions/settings-actions";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    interface SettingsData {
        madrasaName: string;
        madrasaAddress?: string;
        contactEmail?: string;
        contactPhone?: string;
    }
    const [settings, setSettings] = useState<SettingsData | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const data = await getSiteSettings();
            setSettings(data);
        };
        fetch();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            madrasaName: formData.get("madrasaName") as string,
            madrasaAddress: formData.get("madrasaAddress") as string,
            contactEmail: formData.get("contactEmail") as string,
            contactPhone: formData.get("contactPhone") as string,
            siteActive: true,
        };

        try {
            await updateSiteSettings(data);
            alert("Settings updated successfully!");
        } catch (err) {
            alert("Error updating settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Site Configuration</h1>
                <p className="text-zinc-500 text-lg">Manage institutional information and global system settings.</p>
            </div>

            <div className="max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                        <CardHeader>
                            <CardTitle>Institution Profile</CardTitle>
                            <CardDescription>Primary identification details for reports and invoices.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="madrasaName">Madrasa Full Name (Bangla/English)</Label>
                                <Input id="madrasaName" name="madrasaName" defaultValue={settings?.madrasaName} placeholder="ইন্টারনেট মাদ্রাসা" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="madrasaAddress">Physical Address</Label>
                                <Input id="madrasaAddress" name="madrasaAddress" defaultValue={settings?.madrasaAddress} placeholder="Dhaka, Bangladesh" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Administrative Email</Label>
                                    <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings?.contactEmail} placeholder="admin@internetmadrasa.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">Contact Phone / WhatsApp</Label>
                                    <Input id="contactPhone" name="contactPhone" defaultValue={settings?.contactPhone} placeholder="+8801..." />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8" disabled={loading}>
                                    {loading ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
