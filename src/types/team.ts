import type { PokemonType } from "./pokemon";

export type Nature =
  | "Adamant"
  | "Modest"
  | "Jolly"
  | "Timid"
  | "Bold"
  | "Calm"
  | "Impish"
  | "Careful"
  | "Brave"
  | "Quiet"
  | "Relaxed"
  | "Sassy"
  | "Hardy";

export interface EVSpread {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export type EVPresetId =
  | "fast-physical"
  | "fast-special"
  | "bulky-physical"
  | "bulky-special"
  | "custom";

export interface TeamSlot {
  speciesId: number | null;
  speciesName: string | null;
  nickname: string | null;
  ability: string | null;
  item: string | null;
  teraType: PokemonType | null;
  moves: (string | null)[];
  nature: Nature;
  evPresetId: EVPresetId;
  evs: EVSpread;
  level: number;
}

export interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  slots: TeamSlot[];
}
