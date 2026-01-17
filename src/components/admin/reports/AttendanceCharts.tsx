"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type TrendItem = {
    date: string;
    count: number;
};

export function AttendanceTrendChart({ data }: { data: TrendItem[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-zinc-400">No Data</div>;

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis
                    dataKey="date"
                    stroke="#71717A"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#71717A"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#F4F4F5' }}
                />
                <Bar
                    dataKey="count"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
