"use client";

import { Panel } from "@/components/ui/panel";
import { TypeBadge } from "@/components/ui/type-badge";
import type { TypeColumnSummary } from "./calc";
import type { TeamAnalytics } from "@/features/analytics/use-team-analytics";

interface SynergyMatrixPanelProps {
  analytics: TeamAnalytics;
}

export function SynergyMatrixPanel({ analytics }: SynergyMatrixPanelProps) {
  const { matrix, filledSlotCount } = analytics;

  return (
    <Panel
      label="TYPE SYNERGY MATRIX"
      meta={`${filledSlotCount} ACTIVE`}
      bodyClassName="overflow-x-auto"
    >
      {filledSlotCount === 0 ? (
        <EmptyState />
      ) : (
        <table className="w-full border-collapse mono text-[12px] min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left p-2 border-b border-hairline label sticky left-0 bg-panel z-10">
                ATTACK
              </th>
              <th className="p-2 border-b border-hairline label">IMM</th>
              <th className="p-2 border-b border-hairline label">RESIST</th>
              <th className="p-2 border-b border-hairline label">NEUTRAL</th>
              <th className="p-2 border-b border-hairline label text-warn">WEAK</th>
              <th className="p-2 border-b border-hairline label text-alert">4×</th>
            </tr>
          </thead>
          <tbody>
            {matrix.columns.map((column) => (
              <MatrixRow key={column.attackingType} column={column} slotTotal={filledSlotCount} />
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function EmptyState() {
  return (
    <div className="p-6 text-center">
      <div className="label text-fg-muted cursor-blink">
        NO POKÉMON · ADD ONE TO BEGIN ANALYSIS
      </div>
    </div>
  );
}

function MatrixRow({
  column,
  slotTotal,
}: {
  column: TypeColumnSummary;
  slotTotal: number;
}) {
  const neutral = slotTotal - column.immuneCount - column.resistCount - column.weakCount;
  const isMajorWeak = column.weakCount >= 3;
  const hasDoubleWeak = column.doubleWeakCount > 0;

  return (
    <tr
      className={`border-b border-hairline transition-colors ${
        isMajorWeak ? "bg-alert/5" : ""
      }`}
    >
      <td className="p-2 sticky left-0 bg-panel z-10">
        <TypeBadge type={column.attackingType} size="xs" />
      </td>
      <Cell value={column.immuneCount} tone="info" />
      <Cell value={column.resistCount} tone="accent" />
      <Cell value={neutral} tone="neutral" />
      <Cell
        value={column.weakCount}
        tone={isMajorWeak ? "alert" : column.weakCount > 0 ? "warn" : "neutral"}
      />
      <Cell
        value={column.doubleWeakCount}
        tone={hasDoubleWeak ? "alert" : "neutral"}
      />
    </tr>
  );
}

function Cell({
  value,
  tone,
}: {
  value: number;
  tone: "accent" | "warn" | "alert" | "info" | "neutral";
}) {
  const color =
    tone === "accent"
      ? "var(--term-accent)"
      : tone === "warn"
        ? "var(--term-warn)"
        : tone === "alert"
          ? "var(--term-alert)"
          : tone === "info"
            ? "var(--term-info)"
            : "var(--term-fg-muted)";
  return (
    <td className="p-2 text-center tabular-nums">
      <span
        style={{
          color: value > 0 ? color : "var(--term-fg-muted)",
          fontWeight: value > 0 ? 600 : 400,
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
    </td>
  );
}
