"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTeamStore } from "@/store/team-store";
import { Panel } from "@/components/ui/panel";
import { buildSpeedTierData } from "./calc";
import type { TeamAnalytics } from "@/features/analytics/use-team-analytics";

// F-AV-04: Recharts is heavy; dynamic import keeps initial load fast.
const SpeedTierChart = dynamic(() => import("./speed-tier-chart"), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-center">
      <span className="label text-fg-muted cursor-blink">LOADING CHART MODULE</span>
    </div>
  ),
});

interface SpeedTierPanelProps {
  analytics: TeamAnalytics;
}

export function SpeedTierPanel({ analytics }: SpeedTierPanelProps) {
  const roster = useTeamStore((state) => state.roster);
  const rows = useMemo(
    () => buildSpeedTierData(roster, analytics.speciesBySlot),
    [roster, analytics.speciesBySlot],
  );

  const hasTeam = analytics.filledSlotCount > 0;

  return (
    <Panel
      label="SPEED TIER"
      meta={hasTeam ? `${analytics.filledSlotCount} TEAM · 8 META` : "META ONLY"}
    >
      <div className="p-3">
        <SpeedTierChart rows={rows} />
      </div>
    </Panel>
  );
}
