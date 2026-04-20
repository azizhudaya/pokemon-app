import type { PokemonType } from "@/types/pokemon";
import type { SynergyMatrix } from "@/features/synergy-matrix/calc";

export interface WeaknessAlert {
  attackingType: PokemonType;
  count: number;
  slotIndices: number[];
  severity: "major" | "critical";
}

const MAJOR_WEAKNESS_THRESHOLD = 3;

/**
 * F-AV-03: flag any attacking type that exploits 3+ team members (weak = 2×+).
 * Severity escalates to "critical" if any of those members take 4×.
 */
export function computeWeaknessAlerts(
  matrix: SynergyMatrix,
): WeaknessAlert[] {
  const alerts: WeaknessAlert[] = [];
  for (const column of matrix.columns) {
    if (column.weakCount < MAJOR_WEAKNESS_THRESHOLD) continue;
    const slotIndices = column.slots
      .filter((slot) => slot.multiplier > 1)
      .map((slot) => slot.slotIndex);
    alerts.push({
      attackingType: column.attackingType,
      count: column.weakCount,
      slotIndices,
      severity: column.doubleWeakCount > 0 ? "critical" : "major",
    });
  }
  return alerts.sort((a, b) => b.count - a.count);
}
