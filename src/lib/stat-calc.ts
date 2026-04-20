import type { BaseStats, StatKey } from "@/types/pokemon";
import type { EVSpread, Nature } from "@/types/team";

/**
 * Gen 9 stat formulas.
 *
 * HP    = floor( (2 * Base + IV + floor(EV / 4)) * Level / 100 ) + Level + 10
 * Other = floor( floor( (2 * Base + IV + floor(EV / 4)) * Level / 100 + 5 ) * Nature )
 *
 * We assume IV = 31 (standard competitive training) since the tool is aimed at
 * beginners using presets; IVs are not user-facing per the Won't-Have scope.
 */
const DEFAULT_IV = 31;

export function calculateHp(
  base: number,
  ev: number,
  level: number,
  iv: number = DEFAULT_IV,
): number {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

export function calculateStat(
  base: number,
  ev: number,
  level: number,
  natureMultiplier: number,
  iv: number = DEFAULT_IV,
): number {
  const pre = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(pre * natureMultiplier);
}

/** Nature modifiers table — 1.1 on boosted stat, 0.9 on hindered, 1.0 otherwise. */
const NATURE_MOD: Record<Nature, { up: StatKey | null; down: StatKey | null }> = {
  Adamant: { up: "attack", down: "specialAttack" },
  Modest: { up: "specialAttack", down: "attack" },
  Jolly: { up: "speed", down: "specialAttack" },
  Timid: { up: "speed", down: "attack" },
  Bold: { up: "defense", down: "attack" },
  Calm: { up: "specialDefense", down: "attack" },
  Impish: { up: "defense", down: "specialAttack" },
  Careful: { up: "specialDefense", down: "specialAttack" },
  Brave: { up: "attack", down: "speed" },
  Quiet: { up: "specialAttack", down: "speed" },
  Relaxed: { up: "defense", down: "speed" },
  Sassy: { up: "specialDefense", down: "speed" },
  Hardy: { up: null, down: null },
};

export function natureMultiplierFor(nature: Nature, stat: StatKey): number {
  const mod = NATURE_MOD[nature];
  if (mod.up === stat) return 1.1;
  if (mod.down === stat) return 0.9;
  return 1.0;
}

export type ComputedStats = BaseStats;

export function computeFinalStats(
  base: BaseStats,
  evs: EVSpread,
  nature: Nature,
  level: number,
): ComputedStats {
  return {
    hp: calculateHp(base.hp, evs.hp, level),
    attack: calculateStat(base.attack, evs.attack, level, natureMultiplierFor(nature, "attack")),
    defense: calculateStat(base.defense, evs.defense, level, natureMultiplierFor(nature, "defense")),
    specialAttack: calculateStat(
      base.specialAttack,
      evs.specialAttack,
      level,
      natureMultiplierFor(nature, "specialAttack"),
    ),
    specialDefense: calculateStat(
      base.specialDefense,
      evs.specialDefense,
      level,
      natureMultiplierFor(nature, "specialDefense"),
    ),
    speed: calculateStat(base.speed, evs.speed, level, natureMultiplierFor(nature, "speed")),
  };
}

/**
 * Apply item-based speed modifiers after final stat calculation.
 * Choice Scarf multiplies Speed by 1.5; Iron Ball halves it.
 */
export function applyItemSpeedModifier(speed: number, item: string | null): number {
  if (!item) return speed;
  const normalized = item.toLowerCase();
  if (normalized === "choice scarf") return Math.floor(speed * 1.5);
  if (normalized === "iron ball") return Math.floor(speed * 0.5);
  if (normalized === "quick powder") return speed;
  return speed;
}
