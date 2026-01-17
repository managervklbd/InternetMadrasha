import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  ShieldCheck,
  Globe,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/actions/settings-actions";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const settings = await getSiteSettings();
  const madrasaName = settings?.madrasaName || "ইন্টারনেট মাদ্রাসা"; // Fallback if not set

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white dark:bg-zinc-950 font-sans">
      {/* Left Section: Branding & Info */}
      <div className="relative flex w-full flex-col items-center justify-center bg-teal-600 p-8 lg:w-1/2 lg:p-12 overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo Icon */}
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-500/50 shadow-inner">
            <GraduationCap className="h-14 w-14 text-white" />
          </div>

          <h1 className="mb-2 text-4xl font-extrabold text-white lg:text-5xl">{madrasaName}</h1>
          <p className="mb-12 text-lg font-medium text-teal-100/90 tracking-wide uppercase">মাদ্রাসা ম্যানেজমেন্ট সিস্টেম</p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
            <FeatureCard
              icon={<Users className="w-8 h-8 text-white" />}
              label="ছাত্র ব্যবস্থাপনা"
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-white" />}
              label="একাডেমিক ট্র্যাকিং"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8 text-white" />}
              label="ফলাফল প্রকাশ"
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-white" />}
              label="নিরাপদ সিস্টেম"
            />
          </div>

          <p className="mt-16 text-sm text-teal-100/60 font-medium">© {new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </div>

      {/* Right Section: Login Form */}
      <div className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-12 bg-zinc-50 dark:bg-zinc-950">
        <LoginForm />

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-2 pt-4 mt-8">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">রিয়েল-টাইম ডেটা সিঙ্ক</span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">Developed By <span className="font-bold text-zinc-500 dark:text-zinc-400">Maxtechbd.com</span></p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-6 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-default group">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500 shadow-md group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-lg font-bold text-white text-left leading-tight">{label}</span>
    </div>
  );
}
