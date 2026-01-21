import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import { getSiteSettings } from "@/lib/actions/settings-actions";

export default async function LoginPage() {
    const settings = await getSiteSettings();

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Hero/Branding */}
            <div className="relative hidden lg:flex flex-col bg-teal-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-pattern-islamic opacity-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 to-emerald-900/90 z-0"></div>

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden p-3">
                        {settings?.madrasaLogo ? (
                            <img src={settings.madrasaLogo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-4xl font-bold font-bengali text-teal-900">{settings?.madrasaName?.charAt(0) || 'M'}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold font-bengali tracking-wide leading-tight">{settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"}</h1>
                        <p className="text-teal-100 text-lg max-w-md mx-auto">আধুনিক প্রযুক্তি ও ইসলামী শিক্ষার সমন্বয়</p>
                    </div>
                </div>

                <div className="relative z-10 p-8 text-center text-teal-200/60 text-sm">
                    &copy; {new Date().getFullYear()} {settings?.madrasaName || "Internet Madrasah"}. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 bg-zinc-50 dark:bg-black">
                <div className="w-full max-w-md space-y-4">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
