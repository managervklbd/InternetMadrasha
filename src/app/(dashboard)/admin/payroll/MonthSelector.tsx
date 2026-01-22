"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function MonthSelector({ currentMonth, currentYear }: { currentMonth: number, currentYear: number }) {
    const router = useRouter();
    const years = [2024, 2025, 2026, 2027]; // Can be dynamic
    const months = [
        { value: 1, label: "জানুয়ারি" },
        { value: 2, label: "ফেব্রুয়ারি" },
        { value: 3, label: "মার্চ" },
        { value: 4, label: "এপ্রিল" },
        { value: 5, label: "মে" },
        { value: 6, label: "জুন" },
        { value: 7, label: "জুলাই" },
        { value: 8, label: "আগস্ট" },
        { value: 9, label: "সেপ্টেম্বর" },
        { value: 10, label: "অক্টোবর" },
        { value: 11, label: "নভেম্বর" },
        { value: 12, label: "ডিসেম্বর" },
    ];

    const handleMonthChange = (val: string) => {
        router.push(`?month=${val}&year=${currentYear}`);
    };

    const handleYearChange = (val: string) => {
        router.push(`?month=${currentMonth}&year=${val}`);
    };

    return (
        <div className="flex gap-2">
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((m) => (
                        <SelectItem key={m.value} value={m.value.toString()}>
                            {m.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
