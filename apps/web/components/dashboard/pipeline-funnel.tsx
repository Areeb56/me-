"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";

const data = [
  { stage: "Prospect", count: 245, color: "#6366f1" },
  { stage: "Contacted", count: 180, color: "#818cf8" },
  { stage: "Replied", count: 95, color: "#a5b4fc" },
  { stage: "Meeting", count: 42, color: "#c7d2fe" },
  { stage: "Won", count: 18, color: "#22c55e" },
];

export function PipelineFunnel() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          dataKey="stage"
          type="category"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
