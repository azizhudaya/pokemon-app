export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export type DamageCategory = "physical" | "special" | "status";

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export type StatKey = keyof BaseStats;

export interface MoveInfo {
  id: number;
  name: string;
  displayName: string;
  type: PokemonType;
  category: DamageCategory;
  power: number | null;
  accuracy: number | null;
  priority: number;
  pp: number;
}

export interface PokemonAbility {
  name: string;
  displayName: string;
  isHidden: boolean;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  abilities: PokemonAbility[];
  baseStats: BaseStats;
  spriteUrl: string | null;
  moves: MoveRef[];
}

export interface MoveRef {
  name: string;
  url: string;
}

export interface PokemonIndexEntry {
  id: number;
  name: string;
  displayName: string;
}
