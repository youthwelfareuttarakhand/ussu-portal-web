"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TrendPoint } from "@/types/api";

export function RegistrationTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#888888" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#888888" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }}
          labelStyle={{ fontWeight: 600, color: "#1A1A2E" }}
        />
        <Line type="monotone" dataKey="count" stroke="#0A1E42" strokeWidth={2.5} dot={{ r: 4, fill: "#0A1E42" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
