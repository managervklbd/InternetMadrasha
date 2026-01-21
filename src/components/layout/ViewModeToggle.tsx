"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps {
    currentMode: "ONLINE" | "OFFLINE";
    onToggle: (mode: "ONLINE" | "OFFLINE") => Promise<void>;
}

export function ViewModeToggle({ currentMode, onToggle }: ViewModeToggleProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            await onToggle(checked ? "ONLINE" : "OFFLINE");
        });
    };

    return (
        <div className="flex items-center gap-2 ml-4">
            <div className={cn(
                "flex items-center gap-2 p-1.5 rounded-full border transition-colors",
                currentMode === "ONLINE"
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                    : "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
            )}>
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                ) : currentMode === "ONLINE" ? (
                    <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <WifiOff className="w-4 h-4 text-zinc-500" />
                )}

                <Label htmlFor="mode-toggle" className="text-xs font-bold cursor-pointer select-none">
                    {currentMode === "ONLINE" ? "Online System" : "Offline System"}
                </Label>

                <Switch
                    id="mode-toggle"
                    checked={currentMode === "ONLINE"}
                    onCheckedChange={handleToggle}
                    className="data-[state=checked]:bg-emerald-600"
                />
            </div>
        </div>
    );
}
