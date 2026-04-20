"use client";

import { useMemo } from "react";
import { useTeamStore } from "@/store/team-store";
import { useRosterSpecies, useMoves } from "@/features/pokemon-data/hooks";
import {
  computeSynergyMatrix,
  type MatrixDefender,
  type SynergyMatrix,
} from "@/features/synergy-matrix/calc";
import {
  computeDamageCategoryBreakdown,
  type DamageCategoryBreakdown,
} from "@/features/damage-category/calc";
import {
  computeWeaknessAlerts,
  type WeaknessAlert,
} from "@/features/weakness-alerts/calc";
import type { MoveInfo, PokemonSpecies } from "@/types/pokemon";

export interface TeamAnalytics {
  matrix: SynergyMatrix;
  damageCategory: DamageCategoryBreakdown;
  alerts: WeaknessAlert[];
  filledSlotCount: number;
  speciesBySlot: (PokemonSpecies | undefined)[];
  moves: MoveInfo[];
  pendingMoves: number;
}

/**
 * Bridge the Zustand roster + fetched species data + fetched move data into
 * the three derived analytics panels. All computation is memoized; panels
 * read slices they need without re-subscribing to the whole object.
 */
export function useTeamAnalytics(): TeamAnalytics {
  const roster = useTeamStore((state) => state.roster);
  const speciesQueries = useRosterSpecies(
    roster.map((slot) => slot.speciesId),
  );
  const speciesBySlot = speciesQueries.map((query) => query.data);

  const allMoveNames = roster.flatMap((slot) =>
    slot.moves.filter((move): move is string => Boolean(move)),
  );
  const moveQueries = useMoves(allMoveNames);
  const moves = moveQueries
    .map((query) => query.data)
    .filter((move): move is MoveInfo => Boolean(move));
  const pendingMoves = moveQueries.filter((q) => q.isLoading).length;

  return useMemo(() => {
    const defenders: MatrixDefender[] = [];
    for (let i = 0; i < roster.length; i += 1) {
      const slot = roster[i];
      const species = speciesBySlot[i];
      if (!slot.speciesId || !species) continue;
      defenders.push({
        slotIndex: i,
        speciesName: species.displayName,
        types: species.types,
        ability: slot.ability,
        teraType: slot.teraType,
      });
    }

    const matrix = computeSynergyMatrix(defenders);
    const damageCategory = computeDamageCategoryBreakdown(moves);
    const alerts = computeWeaknessAlerts(matrix);

    return {
      matrix,
      damageCategory,
      alerts,
      filledSlotCount: defenders.length,
      speciesBySlot,
      moves,
      pendingMoves,
    };
  }, [roster, speciesBySlot, moves, pendingMoves]);
}
