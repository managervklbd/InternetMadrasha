"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Lock, PlayCircle, Clock } from "lucide-react";
import { joinLiveClass } from "@/lib/actions/live-class-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SessionDetail {
    key: string;
    label: string;
    startTime: string;
    endTime: string;
}

interface LiveClass {
    id: string;
    title: string;
    liveLink: string;
    teacher?: { fullName: string };
    sessionDetails: SessionDetail[];
}

interface DashboardLiveClassCardProps {
    liveClass: LiveClass;
    isUnpaid: boolean;
}

export function DashboardLiveClassCard({ liveClass, isUnpaid }: DashboardLiveClassCardProps) {
    const [activeSession, setActiveSession] = useState<SessionDetail | null>(null);

    // Format time helper
    const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(hours), parseInt(minutes));
        return d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    };

    // Check for active session periodically
    useEffect(() => {
        const checkActiveSession = () => {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();

            if (!liveClass.sessionDetails) return;

            const active = liveClass.sessionDetails.find((session) => {
                const [startH, startM] = session.startTime.split(':').map(Number);
                const [endH, endM] = session.endTime.split(':').map(Number);
                const start = startH * 60 + startM;
                const end = endH * 60 + endM;
                return currentTime >= start && currentTime <= end;
            });

            setActiveSession(active || null);
        };

        checkActiveSession();
        const interval = setInterval(checkActiveSession, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [liveClass.sessionDetails]);

    const handleJoin = async () => {
        if (!activeSession) {
            // Fallback: If no session is strictly "active" but user wants to join (e.g. 5 mins early)
            // We could redirect to the generic live link, BUT we won't get attendance.
            // OR we could find the *closest* session?
            // For now, let's allow joining via direct link if no session active, 
            // OR prompts user "No active session".
            // Implementation: Open direct Link.
            window.open(liveClass.liveLink, "_blank");
            return;
        }

        try {
            const link = await joinLiveClass(liveClass.id, activeSession.key);
            window.open(link, "_blank");
        } catch (err: any) {
            toast.error(err.message || "ক্লাসে যোগ দিতে সমস্যা হয়েছে");
        }
    };

    return (
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                        <Video className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-teal-900 dark:text-teal-100">{liveClass.title}</h4>
                        <p className="text-xs text-teal-700 dark:text-teal-400 font-bengali">
                            ওস্তাদ: {liveClass.teacher?.fullName || "নির্ধারিত নেই"}
                        </p>
                    </div>
                </div>

                {isUnpaid ? (
                    <Button disabled className="gap-2 bg-zinc-200 text-zinc-500 font-bengali">
                        <Lock className="w-4 h-4" />
                        লক করা
                    </Button>
                ) : (
                    <Button
                        onClick={handleJoin}
                        className={cn(
                            "gap-2 font-bengali",
                            activeSession ? "bg-teal-600 hover:bg-teal-700 animate-pulse" : "bg-zinc-400 hover:bg-zinc-500"
                        )}
                    >
                        {activeSession ? (
                            <>
                                <PlayCircle className="w-4 h-4" />
                                ক্লাসে যোগ দিন
                            </>
                        ) : (
                            <>
                                <Video className="w-4 h-4" />
                                লিঙ্ক ওপেন করুন
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Show Session Times */}
            {liveClass.sessionDetails && liveClass.sessionDetails.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {liveClass.sessionDetails.map((session) => {
                        const isActive = activeSession?.key === session.key;
                        return (
                            <Badge
                                key={session.key}
                                variant="secondary"
                                className={cn(
                                    "border font-bengali transition-colors",
                                    isActive
                                        ? "bg-teal-600 text-white border-teal-600"
                                        : "bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800"
                                )}
                            >
                                {isActive && <span className="mr-1.5 inline-block w-2 h-2 rounded-full bg-white animate-pulse" />}
                                {session.label}: {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Helper text if no session active */}
            {!activeSession && !isUnpaid && (
                <p className="text-[10px] text-zinc-500 font-bengali italic">
                    * বর্তমানে কোনো ক্লাস সেশন চলছে না। লিঙ্ক ওপেন করলে হাজিরা কাউন্ট হবে না।
                </p>
            )}
        </div>
    );
}
