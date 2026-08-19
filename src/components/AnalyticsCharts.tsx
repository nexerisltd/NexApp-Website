"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const gridColor = "var(--color-border)";
const mutedColor = "var(--color-text-muted)";
const accentColor = "var(--color-accent)";

export function DownloadsTimeSeries({
  data,
}: {
  data: { date: string; downloads: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: mutedColor, fontSize: 11, fontFamily: "monospace" }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: mutedColor, fontSize: 11, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-2)",
            border: `1px solid ${gridColor}`,
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: mutedColor }}
        />
        <Line
          type="monotone"
          dataKey="downloads"
          stroke={accentColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PlatformBreakdown({
  data,
}: {
  data: { platform: string; downloads: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid stroke={gridColor} horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: mutedColor, fontSize: 11, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="platform"
          tick={{ fill: mutedColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-2)",
            border: `1px solid ${gridColor}`,
            borderRadius: 12,
            fontSize: 12,
          }}
          cursor={{ fill: "var(--color-surface-2)" }}
        />
        <Bar dataKey="downloads" fill={accentColor} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
