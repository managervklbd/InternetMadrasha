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
import { ModeToggle } from "@/components/layout/ModeToggle";

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
          <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden p-4 hover:scale-105 transition-transform duration-500 group">
            {settings?.madrasaLogo ? (
              <img src={settings.madrasaLogo} alt="Logo" className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <GraduationCap className="h-16 w-16 text-white" />
            )}
          </div>

          <h1 className="mb-4 text-5xl font-black text-white lg:text-6xl tracking-tight font-bengali">{madrasaName}</h1>

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
      <div className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-12 bg-background">
        <div className="absolute top-8 right-8 z-50">
          <ModeToggle />
        </div>

        <LoginForm />

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-3 pt-8 mt-12 border-t border-border/40 w-full max-w-[440px]">
          <div className="flex items-center gap-2 text-muted-foreground/80">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">রিয়েল-টাইম ডেটা সিঙ্ক</span>
          </div>
          <p className="text-xs text-muted-foreground/60 tracking-wider uppercase font-medium">
            Developed By <span className="font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer">Maxtechbd.com</span>
          </p>
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
