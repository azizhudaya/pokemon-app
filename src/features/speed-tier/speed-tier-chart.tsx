"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTypeColorVar } from "@/components/ui/type-badge";
import type { SpeedRow } from "./calc";

interface SpeedTierChartProps {
  rows: SpeedRow[];
}

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Tracks the container box with a ResizeObserver. Rendering the chart only
 * after the first valid measurement eliminates Recharts' `width(-1) height(-1)`
 * warning, which `ResponsiveContainer` fires on its own initial render pass
 * before its internal `useLayoutEffect` measures dimensions.
 */
function useContainerSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Dimensions | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize((prev) =>
          prev && prev.width === rect.width && prev.height === rect.height
            ? prev
            : { width: rect.width, height: rect.height },
        );
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

export default function SpeedTierChart({ rows }: SpeedTierChartProps) {
  const chartHeight = Math.max(rows.length * 28, 260);
  const [ref, size] = useContainerSize();

  return (
    <div
      ref={ref}
      style={{ height: chartHeight, minWidth: 0 }}
      className="w-full"
    >
      {size ? (
        <BarChart
          width={size.width}
          height={size.height}
          data={rows}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          barCategoryGap={4}
        >
          <CartesianGrid
            strokeDasharray="0"
            horizontal={false}
            stroke="var(--term-hairline)"
          />
          <XAxis
            type="number"
            stroke="var(--term-fg-muted)"
            tick={{
              fontSize: 12,
              fill: "var(--term-fg-muted)",
              fontFamily: "var(--font-jetbrains-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--term-hairline)" }}
          />
          <YAxis
            dataKey="displayName"
            type="category"
            stroke="var(--term-fg-muted)"
            tick={{
              fontSize: 12,
              fill: "var(--term-fg)",
              fontFamily: "var(--font-jetbrains-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--term-hairline)" }}
            width={140}
          />
          <Tooltip
            cursor={{ fill: "rgba(124, 255, 178, 0.06)" }}
            contentStyle={{
              background: "var(--term-panel-elev)",
              border: "1px solid var(--term-hairline-strong)",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "var(--font-jetbrains-mono)",
              color: "var(--term-fg)",
            }}
            labelStyle={{ color: "var(--term-fg)" }}
            itemStyle={{ color: "var(--term-fg)" }}
            formatter={(value, _name, item) => {
              const payload = (item as { payload?: SpeedRow })?.payload;
              const note = payload?.note ?? "";
              return [`${String(value)} SPE`, note];
            }}
          />
          <Bar dataKey="speed" radius={0} isAnimationActive={false}>
            {rows.map((row) => {
              const color =
                row.origin === "team"
                  ? "var(--term-accent)"
                  : getTypeColorVar(row.types[0]);
              return (
                <Cell
                  key={row.id}
                  fill={color}
                  opacity={row.origin === "team" ? 1 : 0.55}
                />
              );
            })}
          </Bar>
        </BarChart>
      ) : null}
    </div>
  );
}
