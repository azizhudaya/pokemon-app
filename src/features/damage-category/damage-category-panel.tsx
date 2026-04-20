"use client";

import { Panel } from "@/components/ui/panel";
import type { TeamAnalytics } from "@/features/analytics/use-team-analytics";

interface DamageCategoryPanelProps {
  analytics: TeamAnalytics;
}

export function DamageCategoryPanel({ analytics }: DamageCategoryPanelProps) {
  const { damageCategory: breakdown } = analytics;
  const { physical, special, status, totalOffensive, skew, warning } = breakdown;

  const physicalPct = totalOffensive === 0 ? 0 : (physical / totalOffensive) * 100;
  const specialPct = totalOffensive === 0 ? 0 : (special / totalOffensive) * 100;

  return (
    <Panel label="DAMAGE CATEGORY" meta={`${breakdown.totalMoves} MOVES`}>
      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <Tile label="PHYSICAL" value={physical} tone={skew === "physical" ? "alert" : "accent"} />
          <Tile label="SPECIAL" value={special} tone={skew === "special" ? "alert" : "accent"} />
          <Tile label="STATUS" value={status} tone="info" />
        </div>

        {totalOffensive > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="label">PHY/SPA RATIO</span>
              <span className="mono text-[10px] text-fg-muted tracking-wider">
                {physicalPct.toFixed(0)}% / {specialPct.toFixed(0)}%
              </span>
            </div>
            <div
              className="flex h-2 w-full overflow-hidden border border-hairline"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={physicalPct}
              aria-label="Physical share of offensive moves"
            >
              <div
                className="h-full"
                style={{
                  width: `${physicalPct}%`,
                  background: "var(--term-accent)",
                }}
              />
              <div
                className="h-full"
                style={{
                  width: `${specialPct}%`,
                  background: "var(--term-info)",
                }}
              />
            </div>
          </div>
        ) : null}

        {warning ? (
          <div
            role="status"
            aria-live="polite"
            className="mono text-[10px] tracking-wider uppercase px-3 py-2 border border-warn/30 bg-warn/5 text-warn animate-slide-up"
          >
            ! {warning}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "alert" | "info";
}) {
  const color =
    tone === "alert"
      ? "var(--term-alert)"
      : tone === "info"
        ? "var(--term-info)"
        : "var(--term-accent)";
  return (
    <div className="border border-hairline bg-void p-3 flex flex-col gap-1">
      <span className="label">{label}</span>
      <span
        className="mono text-2xl tabular-nums"
        style={{ color }}
      >
        {String(value).padStart(2, "0")}
      </span>
    </div>
  );
}
