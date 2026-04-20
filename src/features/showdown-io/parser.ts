import { z } from "zod";
import type { PokemonType } from "@/types/pokemon";
import type { EVSpread, Nature, TeamSlot } from "@/types/team";
import { POKEMON_TYPES } from "@/types/pokemon";

/**
 * Showdown text format (F-TB-04):
 *
 *   Nickname (Species) (F) @ Item
 *   Ability: Ability Name
 *   Level: 50
 *   Tera Type: Type
 *   EVs: 252 HP / 4 Def / 252 SpD
 *   Nature Nature
 *   - Move 1
 *   - Move 2
 *   ...
 *
 * Pokémon entries are separated by blank lines. This parser is intentionally
 * conservative — anything it cannot confidently map is left as the slot's
 * default so the rest of the team still loads cleanly.
 */

const EvLine = z.object({
  hp: z.number().int().min(0).max(252).default(0),
  attack: z.number().int().min(0).max(252).default(0),
  defense: z.number().int().min(0).max(252).default(0),
  specialAttack: z.number().int().min(0).max(252).default(0),
  specialDefense: z.number().int().min(0).max(252).default(0),
  speed: z.number().int().min(0).max(252).default(0),
});

const EV_LABELS: Record<string, keyof EVSpread> = {
  hp: "hp",
  atk: "attack",
  def: "defense",
  spa: "specialAttack",
  spd: "specialDefense",
  spe: "speed",
};

const VALID_NATURES: Nature[] = [
  "Adamant",
  "Modest",
  "Jolly",
  "Timid",
  "Bold",
  "Calm",
  "Impish",
  "Careful",
  "Brave",
  "Quiet",
  "Relaxed",
  "Sassy",
  "Hardy",
];

export interface ParsedShowdownTeam {
  slots: TeamSlot[];
  warnings: string[];
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseHeaderLine(line: string): { speciesName: string | null; item: string | null } {
  const [left, right] = line.split("@").map((part) => part.trim());
  if (!left) return { speciesName: null, item: null };

  let species = left;
  const parenMatch = left.match(/\(([^)]+)\)/g);
  if (parenMatch && parenMatch.length > 0) {
    // When a nickname is used, species appears in the last parenthesized token
    // that is not a gender marker.
    const candidates = parenMatch
      .map((p) => p.slice(1, -1))
      .filter((token) => token !== "M" && token !== "F");
    if (candidates.length > 0) {
      species = candidates[candidates.length - 1];
    } else {
      species = left.replace(/\s*\([MF]\)\s*$/, "");
    }
  }

  return {
    speciesName: slugify(species) || null,
    item: right && right.length > 0 ? right : null,
  };
}

function parseEvs(line: string): EVSpread {
  const base: EVSpread = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
  for (const segment of line.split("/")) {
    const trimmed = segment.trim();
    const match = trimmed.match(/^(\d+)\s+([A-Za-z]+)$/);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    const key = EV_LABELS[match[2].toLowerCase()];
    if (key) base[key] = value;
  }
  return EvLine.parse(base);
}

function parseTeraType(value: string): PokemonType | null {
  const normalized = value.trim().toLowerCase();
  return (POKEMON_TYPES as readonly string[]).includes(normalized)
    ? (normalized as PokemonType)
    : null;
}

function parseNature(line: string): Nature | null {
  const name = line.replace(/\s+Nature$/i, "").trim();
  const match = VALID_NATURES.find((n) => n.toLowerCase() === name.toLowerCase());
  return match ?? null;
}

function parseMoveLine(line: string): string {
  return slugify(line.replace(/^[-•]\s*/, ""));
}

function emptySlot(): TeamSlot {
  return {
    speciesId: null,
    speciesName: null,
    nickname: null,
    ability: null,
    item: null,
    teraType: null,
    moves: [null, null, null, null],
    nature: "Hardy",
    evPresetId: "custom",
    evs: {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    },
    level: 50,
  };
}

function parseSlot(block: readonly string[], warnings: string[]): TeamSlot {
  const slot = emptySlot();
  const moveList: string[] = [];

  for (let i = 0; i < block.length; i += 1) {
    const rawLine = block[i];
    const line = rawLine.trim();
    if (!line) continue;

    if (i === 0) {
      const { speciesName, item } = parseHeaderLine(line);
      slot.speciesName = speciesName;
      slot.item = item;
      continue;
    }

    if (/^Ability:/i.test(line)) {
      slot.ability = line.replace(/^Ability:\s*/i, "").trim() || null;
    } else if (/^Level:/i.test(line)) {
      const level = Number.parseInt(line.replace(/^Level:\s*/i, ""), 10);
      if (!Number.isNaN(level)) slot.level = level;
    } else if (/^Tera Type:/i.test(line)) {
      const raw = line.replace(/^Tera Type:\s*/i, "").trim();
      const parsed = parseTeraType(raw);
      if (parsed) slot.teraType = parsed;
      else warnings.push(`Unknown Tera Type "${raw}"`);
    } else if (/^EVs:/i.test(line)) {
      slot.evs = parseEvs(line.replace(/^EVs:\s*/i, ""));
    } else if (/Nature$/i.test(line)) {
      const nature = parseNature(line);
      if (nature) slot.nature = nature;
      else warnings.push(`Unknown nature "${line}"`);
    } else if (/^[-•]/.test(line) && moveList.length < 4) {
      moveList.push(parseMoveLine(line));
    }
  }

  while (moveList.length < 4) moveList.push("");
  slot.moves = moveList.slice(0, 4).map((m) => (m ? m : null));
  return slot;
}

export function parseShowdownTeam(text: string): ParsedShowdownTeam {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return { slots: [], warnings: ["Input is empty"] };

  const blocks: string[][] = [];
  let current: string[] = [];
  for (const rawLine of normalized.split("\n")) {
    if (rawLine.trim() === "") {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
    } else {
      current.push(rawLine);
    }
  }
  if (current.length > 0) blocks.push(current);

  const warnings: string[] = [];
  const slots: TeamSlot[] = [];
  for (const block of blocks.slice(0, 6)) {
    try {
      slots.push(parseSlot(block, warnings));
    } catch (error) {
      warnings.push(
        error instanceof Error ? error.message : "Failed to parse a team member",
      );
    }
  }

  if (slots.length === 0) warnings.push("Could not parse any Pokémon from input");

  return { slots, warnings };
}
