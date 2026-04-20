import type { PokemonType } from "@/types/pokemon";

/**
 * Hardcoded Gen 9 VGC benchmark set. Speeds are computed at Level 50, 31 IVs,
 * 252 Speed EVs, and the canonical speed-boosting nature (where applicable).
 * These values answer the PRD §10 open question "which meta threats?" with a
 * curated list beginners should know.
 */
export interface MetaThreat {
  name: string;
  displayName: string;
  types: PokemonType[];
  speedAt50: number;
  note: string;
}

export const META_THREATS: MetaThreat[] = [
  {
    name: "flutter-mane",
    displayName: "Flutter Mane",
    types: ["ghost", "fairy"],
    speedAt50: 205,
    note: "Timid, 252 Spe",
  },
  {
    name: "iron-hands",
    displayName: "Iron Hands",
    types: ["fighting", "electric"],
    speedAt50: 101,
    note: "Adamant, 0 Spe",
  },
  {
    name: "chien-pao",
    displayName: "Chien-Pao",
    types: ["dark", "ice"],
    speedAt50: 189,
    note: "Jolly, 252 Spe",
  },
  {
    name: "urshifu-rapid-strike",
    displayName: "Urshifu-Rapid Strike",
    types: ["fighting", "water"],
    speedAt50: 167,
    note: "Jolly, 252 Spe",
  },
  {
    name: "amoonguss",
    displayName: "Amoonguss",
    types: ["grass", "poison"],
    speedAt50: 51,
    note: "Relaxed, 0 Spe · IV 0",
  },
  {
    name: "incineroar",
    displayName: "Incineroar",
    types: ["fire", "dark"],
    speedAt50: 101,
    note: "Sassy, 0 Spe",
  },
  {
    name: "gholdengo",
    displayName: "Gholdengo",
    types: ["steel", "ghost"],
    speedAt50: 156,
    note: "Timid, 252 Spe",
  },
  {
    name: "rillaboom",
    displayName: "Rillaboom",
    types: ["grass"],
    speedAt50: 156,
    note: "Adamant, 252 Spe",
  },
];
