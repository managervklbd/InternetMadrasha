"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <Button
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 gap-2 shadow-lg"
        >
            <Printer className="w-4 h-4" />
            Print Invoice
        </Button>
    );
}
