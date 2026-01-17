import Link from "next/link";
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
    Calendar
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
    Calendar
};

export function SidebarContent({ role, links, signOutAction }: { role: string, links: any[], signOutAction: () => Promise<void> }) {
    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-teal-950 to-emerald-900 overflow-hidden relative">
            {/* Islamic Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern-islamic opacity-10 pointer-events-none"></div>

            <div className="p-6 relative z-10 border-b border-teal-800/50">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 border border-amber-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <span className="text-amber-400 font-bold text-lg font-bengali">M</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-white font-bengali">ইন্টারনেট মাদ্রাসা</span>
                        <span className="text-[10px] text-teal-200/60 uppercase tracking-widest">Administrator</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1.5 relative z-10 overflow-y-auto no-scrollbar">
                {links.map((link) => {
                    const IconComponent = IconMap[link.iconName] || LayoutDashboard;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-3 text-teal-100/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 group border border-transparent hover:border-amber-500/20"
                        >
                            <IconComponent className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                            <span className="font-medium font-bengali tracking-wide">{link.label}</span>
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
