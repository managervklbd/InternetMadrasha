import AttendanceManager from "@/components/admin/attendance/AttendanceManager";
import { getAdminViewMode } from "@/lib/actions/settings-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export const metadata = {
    title: "হাজিরা ব্যবস্থাপনা | Internet Madrasha",
};

export const revalidate = 3600; // revalidate every hour

export default async function AdminAttendancePage() {
    const viewMode = await getAdminViewMode();

    if (viewMode === "ONLINE") {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
                <div className="p-4 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                    <Video className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold font-bengali">অনলাইন মোড চালু আছে</h2>
                <p className="text-zinc-500 max-w-md font-bengali">
                    অনলাইন ক্লাসের হাজিরা অটোমেটিকালি জুম/লাইভ ক্লাস থেকে ট্র্যাক করা হয়।
                    ম্যানুয়াল হাজিরার জন্য অনুগ্রহ করে অফলাইন মোডে স্যুইচ করুন অথবা লাইভ ক্লাস ব্যবস্থাপনায় যান।
                </p>
                <Link href="/admin/live-classes">
                    <Button className="font-bengali bg-teal-600 hover:bg-teal-700">
                        লাইভ ক্লাস ব্যবস্থাপনা
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-bengali text-zinc-900 dark:text-zinc-50">
                    হাজিরা ব্যবস্থাপনা (Manual)
                </h2>
            </div>
            <AttendanceManager viewMode={viewMode} />
        </div>
    );
}
