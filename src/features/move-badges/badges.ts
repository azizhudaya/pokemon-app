import type { MoveInfo } from "@/types/pokemon";

/**
 * Field moves that manipulate speed order even when priority is 0. This list
 * is intentional: it only includes moves beginners should recognize as "speed
 * control", not every Tailwind-ish niche move in the game.
 */
const SPEED_CONTROL_MOVES = new Set([
  "tailwind",
  "trick-room",
  "icy-wind",
  "electroweb",
  "thunder-wave",
  "bulldoze",
]);

export type BadgeKind =
  | "priority-plus"
  | "priority-minus"
  | "prankster"
  | "speed-control";

export interface MoveBadgeInfo {
  kind: BadgeKind;
  label: string;
  description: string;
}

/**
 * Given a move + its user's ability, return every badge that applies.
 * Prankster converts Status moves to priority +1 — noted via a dedicated
 * badge instead of mutating the numeric priority display.
 */
export function computeMoveBadges(
  move: MoveInfo,
  ability: string | null,
): MoveBadgeInfo[] {
  const badges: MoveBadgeInfo[] = [];

  if (move.priority > 0) {
    badges.push({
      kind: "priority-plus",
      label: `+${move.priority}`,
      description: `Priority +${move.priority}`,
    });
  } else if (move.priority < 0) {
    badges.push({
      kind: "priority-minus",
      label: String(move.priority),
      description: `Priority ${move.priority}`,
    });
  }

  if (
    ability &&
    ability.toLowerCase() === "prankster" &&
    move.category === "status" &&
    move.priority === 0
  ) {
    badges.push({
      kind: "prankster",
      label: "PRANK",
      description: "Prankster grants +1 priority to Status moves",
    });
  }

  if (SPEED_CONTROL_MOVES.has(move.name)) {
    badges.push({
      kind: "speed-control",
      label: "SPD",
      description: "Speed control — changes turn order",
    });
  }

  return badges;
}
