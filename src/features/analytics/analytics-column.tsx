"use client";

import { useTeamAnalytics } from "./use-team-analytics";
import { WeaknessAlertsPanel } from "@/features/weakness-alerts/weakness-alerts-panel";
import { SynergyMatrixPanel } from "@/features/synergy-matrix/synergy-matrix-panel";
import { DamageCategoryPanel } from "@/features/damage-category/damage-category-panel";
import { SpeedTierPanel } from "@/features/speed-tier/speed-tier-panel";

export function AnalyticsColumn() {
  const analytics = useTeamAnalytics();
  return (
    <div className="flex flex-col gap-4">
      <WeaknessAlertsPanel analytics={analytics} />
      <SynergyMatrixPanel analytics={analytics} />
      <DamageCategoryPanel analytics={analytics} />
      <SpeedTierPanel analytics={analytics} />
    </div>
  );
}
