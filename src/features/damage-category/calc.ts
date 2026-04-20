import type { DamageCategory, MoveInfo } from "@/types/pokemon";

export interface DamageCategoryBreakdown {
  physical: number;
  special: number;
  status: number;
  totalOffensive: number;
  totalMoves: number;
  physicalRatio: number;
  specialRatio: number;
  skew: "physical" | "special" | "status" | "balanced" | "empty";
  warning: string | null;
}

const BODY_PRESS_LIKE: Record<string, DamageCategory | undefined> = {
  // F-AV-02 edge case: override PokéAPI's category for moves that use an
  // unexpected stat. Body Press uses Defense (physical contact but scales
  // with Defense); Foul Play uses the target's Attack. For the category
  // breakdown we keep them grouped with whichever side they *feel* like.
  "body-press": "physical",
  "foul-play": "physical",
};

function normalizeCategory(move: MoveInfo): DamageCategory {
  const override = BODY_PRESS_LIKE[move.name];
  return override ?? move.category;
}

export function computeDamageCategoryBreakdown(
  moves: readonly MoveInfo[],
): DamageCategoryBreakdown {
  let physical = 0;
  let special = 0;
  let status = 0;
  for (const move of moves) {
    switch (normalizeCategory(move)) {
      case "physical":
        physical += 1;
        break;
      case "special":
        special += 1;
        break;
      case "status":
        status += 1;
        break;
    }
  }
  const totalOffensive = physical + special;
  const totalMoves = totalOffensive + status;
  const physicalRatio = totalOffensive === 0 ? 0 : physical / totalOffensive;
  const specialRatio = totalOffensive === 0 ? 0 : special / totalOffensive;

  let skew: DamageCategoryBreakdown["skew"];
  if (totalMoves === 0) {
    skew = "empty";
  } else if (totalOffensive === 0) {
    skew = "status";
  } else if (physicalRatio >= 0.9) {
    skew = "physical";
  } else if (specialRatio >= 0.9) {
    skew = "special";
  } else {
    skew = "balanced";
  }

  const warning =
    skew === "physical"
      ? "Team is almost entirely Physical — a single Physical wall could stop you."
      : skew === "special"
        ? "Team is almost entirely Special — a single Special wall could stop you."
        : skew === "status"
          ? "No offensive moves selected yet."
          : null;

  return {
    physical,
    special,
    status,
    totalOffensive,
    totalMoves,
    physicalRatio,
    specialRatio,
    skew,
    warning,
  };
}
