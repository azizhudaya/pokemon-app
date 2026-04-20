import type { EVPresetId, EVSpread, Nature } from "@/types/team";

export interface EVPresetDefinition {
  id: Exclude<EVPresetId, "custom">;
  label: string;
  description: string;
  nature: Nature;
  evs: EVSpread;
}

/**
 * The four preset roles shield beginners from granular EV work (F-TB-05).
 * Each preset pushes the maximum allowed 252/252/4 split into the role's
 * primary pair and pairs with the appropriate nature.
 */
export const EV_PRESETS: EVPresetDefinition[] = [
  {
    id: "fast-physical",
    label: "Fast Physical",
    description: "Max Attack + Max Speed, Jolly",
    nature: "Jolly",
    evs: {
      hp: 4,
      attack: 252,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 252,
    },
  },
  {
    id: "fast-special",
    label: "Fast Special",
    description: "Max Sp. Atk + Max Speed, Timid",
    nature: "Timid",
    evs: {
      hp: 4,
      attack: 0,
      defense: 0,
      specialAttack: 252,
      specialDefense: 0,
      speed: 252,
    },
  },
  {
    id: "bulky-physical",
    label: "Bulky Physical",
    description: "Max HP + Max Attack, Adamant",
    nature: "Adamant",
    evs: {
      hp: 252,
      attack: 252,
      defense: 4,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    },
  },
  {
    id: "bulky-special",
    label: "Bulky Special",
    description: "Max HP + Max Sp. Atk, Modest",
    nature: "Modest",
    evs: {
      hp: 252,
      attack: 0,
      defense: 4,
      specialAttack: 252,
      specialDefense: 0,
      speed: 0,
    },
  },
];

export function getPresetById(id: EVPresetId): EVPresetDefinition | null {
  return EV_PRESETS.find((preset) => preset.id === id) ?? null;
}
