"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-teal-400" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl focus:bg-zinc-100 dark:focus:bg-zinc-900 cursor-pointer">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl focus:bg-zinc-100 dark:focus:bg-zinc-900 cursor-pointer">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl focus:bg-zinc-100 dark:focus:bg-zinc-900 cursor-pointer">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
