"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";

export function MobileSidebar({ role, links, signOutAction }: { role: string, links: any[], signOutAction: () => Promise<void> }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-zinc-500 hover:text-zinc-900">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0 bg-transparent w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarContent role={role} links={links} signOutAction={signOutAction} />
            </SheetContent>
        </Sheet>
    );
}
