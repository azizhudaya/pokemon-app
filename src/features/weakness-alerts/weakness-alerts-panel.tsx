"use client";

import { Panel } from "@/components/ui/panel";
import { TypeBadge } from "@/components/ui/type-badge";
import type { TeamAnalytics } from "@/features/analytics/use-team-analytics";

interface WeaknessAlertsPanelProps {
  analytics: TeamAnalytics;
}

export function WeaknessAlertsPanel({ analytics }: WeaknessAlertsPanelProps) {
  const { alerts } = analytics;
  const active = alerts.length > 0;

  return (
    <Panel
      label="MAJOR WEAKNESSES"
      meta={active ? `${alerts.length} FLAGGED` : "ALL CLEAR"}
    >
      <div className="p-4" role="region" aria-live="polite">
        {active ? (
          <ul className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <li
                key={alert.attackingType}
                role="alert"
                className={`flex items-center justify-between gap-3 px-3 py-2 border animate-slide-up ${
                  alert.severity === "critical"
                    ? "border-alert/50 bg-alert/10"
                    : "border-warn/40 bg-warn/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TypeBadge type={alert.attackingType} size="sm" />
                  <span className="mono text-[13px] tracking-wider text-fg">
                    {alert.count} MEMBERS WEAK
                    {alert.severity === "critical" ? " · INCL. 4×" : ""}
                  </span>
                </div>
                <span className="label mono text-fg-muted">
                  SLOTS {alert.slotIndices.map((i) => i + 1).join(",")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mono text-[13px] tracking-wider text-fg-muted uppercase text-center py-2">
            NO TYPE EXPLOITS 3+ MEMBERS · STRONG COVERAGE
          </div>
        )}
      </div>
    </Panel>
  );
}
