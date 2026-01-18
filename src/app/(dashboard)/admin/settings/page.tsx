import { getSiteSettings } from "@/lib/actions/settings-actions";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
    const settings = await getSiteSettings();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-bengali">সাইট কনফিগারেশন</h1>
                <p className="text-zinc-500 text-lg font-bengali">প্রাতিষ্ঠানিক তথ্য এবং গ্লোবাল সেটিংস ম্যানেজ করুন।</p>
            </div>

            <div className="max-w-3xl">
                <SettingsForm initialData={settings} />
            </div>
        </div>
    );
}
