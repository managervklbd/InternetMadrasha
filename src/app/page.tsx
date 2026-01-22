import Image from "next/image";
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
      <div className="relative flex w-full flex-col items-center justify-center bg-teal-600 p-6 lg:w-1/2 lg:p-12 overflow-hidden min-h-[40vh] lg:min-h-screen">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo Icon */}
          <div className="mb-6 lg:mb-10 flex h-20 w-20 lg:h-28 lg:w-28 items-center justify-center rounded-[24px] lg:rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden p-3 lg:p-4 hover:scale-105 transition-transform duration-500 group">
            {settings?.madrasaLogo ? (
              <div className="relative h-full w-full">
                <Image
                  src={settings.madrasaLogo}
                  alt="Logo"
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            ) : (
              <GraduationCap className="h-12 w-12 lg:h-16 lg:w-16 text-white" />
            )}
          </div>

          <h1 className="mb-4 text-3xl font-black text-white md:text-5xl lg:text-6xl tracking-tight font-bengali px-2">{madrasaName}</h1>

          <p className="mt-8 lg:mt-16 text-xs lg:text-sm text-teal-100/60 font-medium">© {new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </div>

      {/* Right Section: Login Form */}
      <div className="relative flex w-full flex-col items-center justify-center p-4 md:p-8 lg:w-1/2 lg:p-12 bg-background min-h-[60vh] lg:min-h-screen">
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50">
          <ModeToggle />
        </div>

        <div className="w-full max-w-[320px] md:max-w-md">
          <LoginForm />
        </div>

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-3 pt-8 mt-8 lg:mt-12 border-t border-border/40 w-full max-w-[320px] md:max-w-[440px]">
          <div className="flex items-center gap-2 text-muted-foreground/80">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">রিয়েল-টাইম ডেটা সিঙ্ক</span>
          </div>
          <p className="text-xs text-muted-foreground/60 tracking-wider uppercase font-medium text-center">
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
