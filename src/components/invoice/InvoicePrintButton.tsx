
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function InvoicePrintButton() {
    return (
        <Button
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bengali rounded-none shadow-lg"
        >
            <Printer className="w-4 h-4 mr-2" />
            প্রিন্ট করুন / ডাউনলোড
        </Button>
    );
}
