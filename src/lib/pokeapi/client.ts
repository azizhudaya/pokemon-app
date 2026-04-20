import type {
  BaseStats,
  MoveInfo,
  PokemonAbility,
  PokemonIndexEntry,
  PokemonSpecies,
  PokemonType,
} from "@/types/pokemon";
import { humanizeSlug } from "./display";

const API_BASE = "https://pokeapi.co/api/v2";

/**
 * PokeAPI raw-shape types — only the fields we need. We never store these in
 * app state; they are mapped into lean interfaces by the fetchers below.
 */
interface RawNamedRef {
  name: string;
  url: string;
}

interface RawPokemonListResponse {
  count: number;
  results: RawNamedRef[];
}

interface RawPokemonDetail {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
      home?: { front_default: string | null };
    };
  };
  types: Array<{ slot: number; type: RawNamedRef }>;
  abilities: Array<{ ability: RawNamedRef; is_hidden: boolean }>;
  stats: Array<{ base_stat: number; stat: RawNamedRef }>;
  moves: Array<{ move: RawNamedRef }>;
}

interface RawMoveDetail {
  id: number;
  name: string;
  type: RawNamedRef;
  damage_class: RawNamedRef;
  power: number | null;
  accuracy: number | null;
  priority: number;
  pp: number | null;
}

/* ===================================================================
   Helpers
   =================================================================== */
function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) return 0;
  return Number.parseInt(match[1], 10);
}

function mapBaseStats(rawStats: RawPokemonDetail["stats"]): BaseStats {
  const pick = (slug: string) =>
    rawStats.find((stat) => stat.stat.name === slug)?.base_stat ?? 0;
  return {
    hp: pick("hp"),
    attack: pick("attack"),
    defense: pick("defense"),
    specialAttack: pick("special-attack"),
    specialDefense: pick("special-defense"),
    speed: pick("speed"),
  };
}

function mapSprite(raw: RawPokemonDetail["sprites"]): string | null {
  return (
    raw.other?.["official-artwork"]?.front_default ??
    raw.other?.home?.front_default ??
    raw.front_default ??
    null
  );
}

/* ===================================================================
   Public fetchers
   =================================================================== */

/**
 * Fetch the lightweight index of all Pokémon (name + url + derived id).
 * This is one request that returns ~1300 rows — tiny JSON (~60KB), ideal for
 * upfront load so the picker has instant client-side fuzzy search.
 */
export async function fetchPokemonIndex(): Promise<PokemonIndexEntry[]> {
  const response = await fetch(`${API_BASE}/pokemon?limit=2000`);
  if (!response.ok) {
    throw new Error(`PokéAPI index fetch failed: ${response.status}`);
  }
  const data = (await response.json()) as RawPokemonListResponse;
  return data.results.map((entry) => ({
    id: extractIdFromUrl(entry.url),
    name: entry.name,
    displayName: humanizeSlug(entry.name),
  }));
}

/**
 * Fetch a single Pokémon's lean detail. Moves reference only name + url here;
 * individual move detail is fetched on demand via fetchMove().
 */
export async function fetchPokemonSpecies(
  idOrName: number | string,
): Promise<PokemonSpecies> {
  const response = await fetch(`${API_BASE}/pokemon/${idOrName}`);
  if (!response.ok) {
    throw new Error(`PokéAPI species fetch failed for ${idOrName}: ${response.status}`);
  }
  const raw = (await response.json()) as RawPokemonDetail;

  const types: PokemonType[] = raw.types
    .sort((a, b) => a.slot - b.slot)
    .map((entry) => entry.type.name as PokemonType);

  const abilities: PokemonAbility[] = raw.abilities.map((entry) => ({
    name: entry.ability.name,
    displayName: humanizeSlug(entry.ability.name),
    isHidden: entry.is_hidden,
  }));

  return {
    id: raw.id,
    name: raw.name,
    displayName: humanizeSlug(raw.name),
    types,
    abilities,
    baseStats: mapBaseStats(raw.stats),
    spriteUrl: mapSprite(raw.sprites),
    moves: raw.moves.map((entry) => entry.move),
  };
}

/**
 * Batch-fetch move details in parallel. Callers should dedupe by name first
 * so we don't ask PokéAPI for the same record twice in a single trigger.
 */
export async function fetchMoves(moveNames: readonly string[]): Promise<MoveInfo[]> {
  const unique = Array.from(new Set(moveNames));
  const results = await Promise.all(unique.map((name) => fetchMove(name)));
  return results;
}

export async function fetchMove(nameOrId: string | number): Promise<MoveInfo> {
  const response = await fetch(`${API_BASE}/move/${nameOrId}`);
  if (!response.ok) {
    throw new Error(`PokéAPI move fetch failed for ${nameOrId}: ${response.status}`);
  }
  const raw = (await response.json()) as RawMoveDetail;
  return {
    id: raw.id,
    name: raw.name,
    displayName: humanizeSlug(raw.name),
    type: raw.type.name as PokemonType,
    category: raw.damage_class.name as MoveInfo["category"],
    power: raw.power,
    accuracy: raw.accuracy,
    priority: raw.priority,
    pp: raw.pp ?? 0,
  };
}
