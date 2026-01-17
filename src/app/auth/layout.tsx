import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <span className="text-black font-bold text-xl">M</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Internet Madrasha</span>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold leading-tight mb-6">
                            Production-Grade management for your Madrasa.
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            Manage online and offline students, automated billing, and fund-isolated accounting in one powerful platform.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <blockquote className="space-y-2">
                        <p className="text-zinc-400">
                            "This system has transformed how we manage our probashi students and our monthly sessions. Highly recommended."
                        </p>
                        <footer className="text-sm font-medium text-white italic">
                            — Admin, General Department
                        </footer>
                    </blockquote>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl -ml-32 -mb-32" />
            </div>

            <div className="flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
