import { POKEMON_TYPES, type PokemonType } from "@/types/pokemon";
import {
  applyAbilityOverrides,
  getTypeMultiplier,
} from "@/lib/type-effectiveness";

/**
 * A defender as the matrix sees it — just the minimum info needed to compute
 * effectiveness. Callers build this from the team store + species cache.
 */
export interface MatrixDefender {
  slotIndex: number;
  speciesName: string;
  types: PokemonType[];
  ability: string | null;
  teraType: PokemonType | null;
}

export interface SlotMatchup {
  slotIndex: number;
  speciesName: string;
  multiplier: number;
}

export interface TypeColumnSummary {
  attackingType: PokemonType;
  slots: SlotMatchup[];
  weakCount: number;
  doubleWeakCount: number;
  resistCount: number;
  immuneCount: number;
}

export interface SynergyMatrix {
  columns: TypeColumnSummary[];
  filledSlotCount: number;
}

/**
 * Tera Type overrides a Pokémon's defensive types entirely while Terastalized.
 * For the analytics we treat the Tera Type as the defender's active type set,
 * since the PRD's stat-driven sanity check (§7) specifically calls this out.
 */
function effectiveDefendingTypes(defender: MatrixDefender): PokemonType[] {
  if (defender.teraType) return [defender.teraType];
  return defender.types;
}

function computeSlotMatchup(
  defender: MatrixDefender,
  attackingType: PokemonType,
): SlotMatchup {
  const defendingTypes = effectiveDefendingTypes(defender);
  const raw = getTypeMultiplier(attackingType, defendingTypes);
  const adjusted = applyAbilityOverrides(raw, attackingType, defender.ability);
  return {
    slotIndex: defender.slotIndex,
    speciesName: defender.speciesName,
    multiplier: adjusted,
  };
}

function summarizeColumn(
  attackingType: PokemonType,
  defenders: readonly MatrixDefender[],
): TypeColumnSummary {
  const slots = defenders.map((defender) =>
    computeSlotMatchup(defender, attackingType),
  );
  let weakCount = 0;
  let doubleWeakCount = 0;
  let resistCount = 0;
  let immuneCount = 0;
  for (const matchup of slots) {
    if (matchup.multiplier === 0) immuneCount += 1;
    else if (matchup.multiplier < 1) resistCount += 1;
    else if (matchup.multiplier >= 4) {
      weakCount += 1;
      doubleWeakCount += 1;
    } else if (matchup.multiplier > 1) weakCount += 1;
  }
  return {
    attackingType,
    slots,
    weakCount,
    doubleWeakCount,
    resistCount,
    immuneCount,
  };
}

export function computeSynergyMatrix(
  defenders: readonly MatrixDefender[],
): SynergyMatrix {
  const columns = POKEMON_TYPES.map((attackingType) =>
    summarizeColumn(attackingType, defenders),
  );
  return {
    columns,
    filledSlotCount: defenders.length,
  };
}
