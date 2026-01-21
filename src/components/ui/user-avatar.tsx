"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    name: string;
    className?: string;
}

export function UserAvatar({ src, name, className }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);

    // Reset error state if src changes
    useEffect(() => {
        setImageError(false);
    }, [src]);

    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "?";

    if (!src || imageError) {
        return (
            <div className={cn("flex items-center justify-center bg-zinc-100 text-zinc-500 font-bold w-full h-full", className)}>
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            className={cn("w-full h-full object-cover", className)}
            onError={() => setImageError(true)}
        />
    );
}
