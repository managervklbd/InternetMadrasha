import AttendanceManager from "@/components/admin/attendance/AttendanceManager";

export const metadata = {
    title: "হাজিরা ব্যবস্থাপনা | Internet Madrasha",
};

export const revalidate = 3600; // revalidate every hour

export default function AdminAttendancePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-bengali text-zinc-900 dark:text-zinc-50">
                    হাজিরা ব্যবস্থাপনা (Attendance Management)
                </h2>
            </div>
            <AttendanceManager />
        </div>
    );
}
