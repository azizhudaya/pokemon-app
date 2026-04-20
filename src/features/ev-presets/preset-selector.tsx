"use client";

import { useMemo } from "react";
import { useTeamStore, useRosterSlot } from "@/store/team-store";
import { useSpecies } from "@/features/pokemon-data/hooks";
import { computeFinalStats } from "@/lib/stat-calc";
import { EV_PRESETS } from "./presets";

interface PresetSelectorProps {
  slotIndex: number;
}

export function PresetSelector({ slotIndex }: PresetSelectorProps) {
  const slot = useRosterSlot(slotIndex);
  const setEVPreset = useTeamStore((state) => state.setEVPreset);
  const speciesQuery = useSpecies(slot.speciesId);
  const species = speciesQuery.data;

  const finalStats = useMemo(() => {
    if (!species) return null;
    return computeFinalStats(species.baseStats, slot.evs, slot.nature, slot.level);
  }, [species, slot.evs, slot.nature, slot.level]);

  if (!species) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="label-strong">EV PRESET</span>
        <span className="label mono text-fg-muted">
          {slot.nature.toUpperCase()} · L{slot.level}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {EV_PRESETS.map((preset) => {
          const active = slot.evPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                setEVPreset(slotIndex, {
                  id: preset.id,
                  nature: preset.nature,
                  evs: preset.evs,
                })
              }
              className={`label tracking-wider text-left px-2 py-1.5 border transition-colors ${
                active
                  ? "border-accent/60 text-accent bg-accent/10"
                  : "border-hairline text-fg-dim hover:text-fg hover:border-hairline-strong"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="mono text-[10px]">{preset.label.toUpperCase()}</span>
                {active ? <span className="text-[9px]">◉</span> : null}
              </div>
            </button>
          );
        })}
      </div>
      {finalStats ? (
        <div className="mono text-[10px] text-fg-dim grid grid-cols-3 gap-x-3 gap-y-0.5 pt-1 border-t border-hairline">
          <StatLine label="HP" value={finalStats.hp} />
          <StatLine label="ATK" value={finalStats.attack} />
          <StatLine label="DEF" value={finalStats.defense} />
          <StatLine label="SPA" value={finalStats.specialAttack} />
          <StatLine label="SPD" value={finalStats.specialDefense} />
          <StatLine label="SPE" value={finalStats.speed} />
        </div>
      ) : null}
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className="text-fg tabular-nums">{value}</span>
    </div>
  );
}
