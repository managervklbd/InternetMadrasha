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
    CalendarCheck,
    Video,
    UserCheck,
    TrendingDown,
    Wallet,
    Heart,
    GraduationCap
} from "lucide-react";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { SidebarContent } from "@/components/layout/SidebarContent";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { getSiteSettings, getAdminViewMode, setAdminViewMode } from "@/lib/actions/settings-actions";
import { ViewModeToggle } from "@/components/layout/ViewModeToggle";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = session?.user?.role || "GUEST";
    const settings = await getSiteSettings();
    const viewMode = await getAdminViewMode();

    const adminLinks = [
        {
            title: "Overview",
            items: [
                { href: "/admin/overview", label: "ড্যাশবোর্ড", iconName: "LayoutDashboard" },
            ]
        },
        {
            title: "Academic Management",
            items: [
                { href: "/admin/live-classes", label: "লাইভ ক্লাস ব্যবস্থাপনা", iconName: "Video" },
                { href: "/admin/attendance", label: "হাজিরা ইনপুট", iconName: "Calendar" },
                { href: "/admin/homework", label: "হোমওয়ার্ক ম্যানেজমেন্ট", iconName: "BookOpen" },
                { href: "/admin/gradebook", label: "গ্রেড বুক (ফলাফল)", iconName: "GraduationCap" },
                { href: "/admin/lessons", label: "লেসন ও রিসোর্স", iconName: "BookOpen" },
                { href: "/admin/academics", label: "একাডেমিক সেটআপ", iconName: "Settings" },
            ]
        },
        {
            title: "User Management",
            items: [
                { href: "/admin/students", label: "ছাত্র ব্যবস্থাপনা", iconName: "Users" },
                { href: "/admin/teachers", label: "শিক্ষক তালিকা", iconName: "UserCircle" },
            ]
        },
        {
            title: "Finance",
            items: [
                { href: "/admin/billing", label: "হিসাব ও পেমেন্ট", iconName: "CreditCard" },
                { href: "/admin/payroll", label: "শিক্ষক বেতন", iconName: "Banknote" },
                { href: "/admin/expenses", label: "খরচ ব্যবস্থাপনা", iconName: "TrendingDown" },
                { href: "/admin/donations", label: "কমিটি / দান", iconName: "HeartHandshake" },
            ]
        },
        {
            title: "Reports",
            items: [
                { href: "/admin/reports/financial", label: "আর্থিক প্রতিবেদন", iconName: "PieChart" },
                { href: "/admin/reports/profit-loss", label: "লাভ-ক্ষতি বিবরণী", iconName: "Wallet" },
                { href: "/admin/reports/students", label: "ছাত্র পরিসংখ্যান", iconName: "Users" },
                { href: "/admin/reports/attendance", label: "হাজিরা রিপোর্ট", iconName: "CalendarCheck" },
                { href: "/admin/teacher-attendance", label: "শিক্ষক হাজিরা", iconName: "UserCheck" },
            ]
        },
        {
            title: "System Parameters",
            items: [
                { href: "/admin/audit", label: "অডিট লগ", iconName: "ShieldAlert" },
                { href: "/admin/settings", label: "সেটিংস", iconName: "Settings" },
            ]
        }
    ];

    const teacherLinks = [
        {
            title: "Overview",
            items: [
                { href: "/teacher/overview", label: "ড্যাশবোর্ড", iconName: "LayoutDashboard" },
            ]
        },
        {
            title: "Teaching & Assessment",
            items: [
                { href: "/teacher/live-classes", label: "লাইভ ক্লাস", iconName: "Video" },
                { href: "/teacher/lessons", label: "ভিডিও লেসন ও রিসোর্স", iconName: "BookOpen" },
                { href: "/teacher/attendance", label: "ছাত্র হাজিরা", iconName: "Calendar" },
                { href: "/teacher/homework", label: "হোমওয়ার্ক / অ্যাসাইনমেন্ট", iconName: "BookOpen" },
                { href: "/teacher/marks", label: "গ্রেড বুক (নম্বর এন্ট্রি)", iconName: "CalendarCheck" },
            ]
        },
        {
            title: "Finance",
            items: [
                { href: "/teacher/hajira", label: "আমার হাজিরা", iconName: "UserCheck" },
                { href: "/teacher/payroll", label: "বেতন বিবরণী", iconName: "CreditCard" },
            ]
        }
    ];

    let studentMode = "ONLINE";
    if (role === "STUDENT" && session?.user?.id) {
        const { prisma } = await import("@/lib/db");
        const profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            select: { mode: true }
        });
        if (profile) studentMode = profile.mode;
    }

    const studentLinks = [
        {
            title: "Overview",
            items: [
                { href: "/student/overview", label: "ড্যাশবোর্ড", iconName: "LayoutDashboard" },
                { href: "/student/profile", label: "আমার প্রোফাইল", iconName: "UserCircle" },
            ]
        },
        {
            title: "Academic",
            items: [
                ...(studentMode === "ONLINE" ? [{ href: "/student/live-classes", label: "লাইভ ক্লাস", iconName: "Video" }] : []),
                { href: "/student/lessons", label: "ভিডিও লেসন ও রিসোর্স", iconName: "BookOpen" },
                { href: "/student/attendance", label: "হাজিরা রিপোর্ট", iconName: "Calendar" },
                { href: "/student/homework", label: "হোমওয়ার্ক / অ্যাসাইনমেন্ট", iconName: "BookOpen" },
            ]
        },
        {
            title: "Finance",
            items: [
                { href: "/student/billing", label: "পেমেন্ট হিস্ট্রি", iconName: "CreditCard" },
                { href: "/student/donate", label: "দান করুন", iconName: "Heart" },
            ]
        }
    ];

    const links = role === "ADMIN" ? adminLinks : role === "TEACHER" ? teacherLinks : studentLinks;

    async function handleSignOut() {
        "use server";
        await signOut();
    }

    async function toggleViewMode(mode: "ONLINE" | "OFFLINE") {
        "use server";
        await setAdminViewMode(mode);
    }

    return (
        <div className={`flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans print:h-auto print:overflow-visible ${viewMode === 'ONLINE' ? 'theme-online' : 'theme-offline'}`}>
            {/* Desktop Sidebar */}
            <aside className="w-72 hidden lg:flex border-r border-teal-800 flex-col relative overflow-hidden shadow-2xl print:hidden">
                <SidebarContent
                    role={role}
                    links={links}
                    signOutAction={handleSignOut}
                    brandName={settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"}
                    brandLogo={settings?.madrasaLogo}
                    viewMode={role === 'ADMIN' ? viewMode : undefined}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 print:overflow-visible">
                <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <MobileSidebar
                            role={role}
                            links={links}
                            signOutAction={handleSignOut}
                            brandName={settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"}
                            brandLogo={settings?.madrasaLogo}
                            viewMode={role === 'ADMIN' ? viewMode : undefined}
                        />

                        <div>
                            <h2 className="text-xl md:text-2xl font-bold font-bengali text-teal-900 dark:text-teal-50 flex items-center gap-2">
                                {role === "ADMIN" ? "অ্যাডমিন প্যানেল" : role === "TEACHER" ? "শিক্ষক ড্যাশবোর্ড" : "ছাত্র ড্যাশবোর্ড"}
                                {role === "ADMIN" && (
                                    <ViewModeToggle currentMode={viewMode} onToggle={toggleViewMode} />
                                )}
                            </h2>

                            <p className="hidden md:block text-xs text-zinc-500 font-medium">বিসমিল্লাহির রাহমানির রাহিম</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <div className="text-sm text-right hidden md:block">
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{session?.user?.email}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                                {role}
                            </span>
                        </div>
                    </div>
                </header>

                <div key={viewMode} className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
