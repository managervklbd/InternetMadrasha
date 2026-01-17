import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
    Users,
    BookOpen,
    Calendar,
    CreditCard,
    LayoutDashboard,
    Settings,
    LogOut,
    UserCircle,
    PieChart,
    ShieldAlert,
    CalendarCheck
} from "lucide-react";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { SidebarContent } from "@/components/layout/SidebarContent";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = session?.user?.role || "GUEST";

    const adminLinks = [
        { href: "/admin/overview", label: "ড্যাশবোর্ড", iconName: "LayoutDashboard" },
        { href: "/admin/students", label: "ছাত্র ব্যবস্থাপনা", iconName: "Users" },
        { href: "/admin/teachers", label: "শিক্ষক তালিকা", iconName: "UserCircle" },
        { href: "/admin/academics", label: "একাডেমিক সেটআপ", iconName: "BookOpen" },
        { href: "/admin/billing", label: "হিসাব ও পেমেন্ট", iconName: "CreditCard" },
        { href: "/admin/reports/financial", label: "আর্থিক প্রতিবেদন", iconName: "PieChart" },
        { href: "/admin/reports/students", label: "ছাত্র পরিসংখ্যান", iconName: "Users" },
        { href: "/admin/reports/attendance", label: "হাজিরা রিপোর্ট", iconName: "CalendarCheck" },
        { href: "/admin/audit", label: "অডিট লগ", iconName: "ShieldAlert" },
        { href: "/admin/settings", label: "সেটিংস", iconName: "Settings" },
    ];

    const teacherLinks = [
        { href: "/teacher/overview", label: "ড্যাশবোর্ড", iconName: "LayoutDashboard" },
        { href: "/teacher/batches", label: "আমার ক্লাস", iconName: "BookOpen" },
        { href: "/teacher/attendance", label: "হাজিরা", iconName: "Calendar" },
    ];

    const studentLinks = [
        { href: "/student/profile", label: "আমার প্রোফাইল", iconName: "UserCircle" },
        { href: "/student/attendance", label: "হাজিরা রিপোর্ট", iconName: "Calendar" },
        { href: "/student/billing", label: "পেমেন্ট হিস্ট্রি", iconName: "CreditCard" },
    ];

    const links = role === "ADMIN" ? adminLinks : role === "TEACHER" ? teacherLinks : studentLinks;

    async function handleSignOut() {
        "use server";
        await signOut();
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-72 hidden md:flex border-r border-teal-800 flex-col relative overflow-hidden shadow-2xl">
                <SidebarContent role={role} links={links} signOutAction={handleSignOut} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950">
                <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <MobileSidebar role={role} links={links} signOutAction={handleSignOut} />

                        <div>
                            <h2 className="text-xl md:text-2xl font-bold font-bengali text-teal-900 dark:text-teal-50">
                                {role === "ADMIN" ? "অ্যাডমিন প্যানেল" : role === "TEACHER" ? "শিক্ষক ড্যাশবোর্ড" : "ছাত্র ড্যাশবোর্ড"}
                            </h2>
                            <p className="hidden md:block text-xs text-zinc-500 font-medium">বিসমিল্লাহির রাহমানির রাহিম</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right hidden md:block">
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{session?.user?.email}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                                {role}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
