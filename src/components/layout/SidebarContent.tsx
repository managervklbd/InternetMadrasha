"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    LogOut,
    LayoutDashboard,
    Users,
    UserCircle,
    BookOpen,
    CreditCard,
    PieChart,
    CalendarCheck,
    ShieldAlert,
    Settings,
    Calendar,
    Video
} from "lucide-react";

// Map of icon names to components
const IconMap: Record<string, any> = {
    LayoutDashboard,
    Users,
    UserCircle,
    BookOpen,
    CreditCard,
    PieChart,
    CalendarCheck,
    ShieldAlert,
    Settings,
    Calendar,
    Video
};

export function SidebarContent({ role, links, signOutAction, brandName, brandLogo }: { role: string, links: any[], signOutAction: () => Promise<void>, brandName: string, brandLogo?: string | null }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-teal-950 to-emerald-900 overflow-hidden relative">
            {/* Islamic Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern-islamic opacity-10 pointer-events-none"></div>

            <div className="p-6 relative z-10 border-b border-teal-800/50">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 shrink-0 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg group-hover:border-amber-500/50 group-hover:scale-105 transition-all duration-300 overflow-hidden p-1.5">
                        {brandLogo ? (
                            <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-white font-bold text-xl font-bengali">{brandName ? brandName.charAt(0) : 'M'}</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base leading-[1.2] tracking-wide text-white font-bengali line-clamp-2">{brandName || "ইন্টারনেট মাদ্রাসা"}</span>
                        <span className="text-[10px] text-teal-200/80 uppercase tracking-widest truncate">{role}</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1.5 relative z-10 overflow-y-auto no-scrollbar">
                {links.map((link) => {
                    const IconComponent = IconMap[link.iconName] || LayoutDashboard;
                    const isActive = link.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname?.startsWith(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group border border-transparent
                                ${isActive
                                    ? 'bg-white/10 text-white border-amber-500/30 shadow-sm'
                                    : 'text-teal-100/80 hover:text-white hover:bg-white/10 hover:border-amber-500/20'
                                }`}
                        >
                            <IconComponent className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'group-hover:text-amber-400'}`} />
                            <span className={`font-medium font-bengali tracking-wide ${isActive ? 'text-white' : ''}`}>{link.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-teal-800/50 relative z-10 bg-black/20">
                <form action={signOutAction}>
                    <Button variant="ghost" className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-950/30 gap-3">
                        <LogOut className="w-5 h-5" />
                        লগআউট
                    </Button>
                </form>
            </div>
        </div>
    );
}
