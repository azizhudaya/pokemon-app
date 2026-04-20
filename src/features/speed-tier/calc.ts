import {
  applyItemSpeedModifier,
  calculateStat,
  natureMultiplierFor,
} from "@/lib/stat-calc";
import type { PokemonSpecies, PokemonType } from "@/types/pokemon";
import type { TeamSlot } from "@/types/team";
import { META_THREATS } from "@/data/meta-threats";

export interface SpeedRow {
  id: string;
  displayName: string;
  speed: number;
  types: PokemonType[];
  note: string | null;
  origin: "team" | "meta";
  slotIndex: number | null;
}

/**
 * Build the speed tier dataset from the roster, using each slot's EVs / nature
 * / item. We compute the true in-battle speed at Lv50, including Choice Scarf
 * / Iron Ball modifiers, then merge the 8 hardcoded meta threats.
 */
export function buildSpeedTierData(
  roster: readonly TeamSlot[],
  speciesBySlot: readonly (PokemonSpecies | undefined)[],
): SpeedRow[] {
  const teamRows: SpeedRow[] = [];
  for (let i = 0; i < roster.length; i += 1) {
    const slot = roster[i];
    const species = speciesBySlot[i];
    if (!slot.speciesId || !species) continue;

    const natureMultiplier = natureMultiplierFor(slot.nature, "speed");
    const rawSpeed = calculateStat(
      species.baseStats.speed,
      slot.evs.speed,
      slot.level,
      natureMultiplier,
    );
    const adjusted = applyItemSpeedModifier(rawSpeed, slot.item);

    teamRows.push({
      id: `team-${i}`,
      displayName: species.displayName,
      speed: adjusted,
      types: species.types,
      note: slot.item === "Choice Scarf" ? "+SCARF" : null,
      origin: "team",
      slotIndex: i,
    });
  }

  const metaRows: SpeedRow[] = META_THREATS.map((threat) => ({
    id: `meta-${threat.name}`,
    displayName: threat.displayName,
    speed: threat.speedAt50,
    types: threat.types,
    note: threat.note,
    origin: "meta",
    slotIndex: null,
  }));

  return [...teamRows, ...metaRows].sort((a, b) => b.speed - a.speed);
}
