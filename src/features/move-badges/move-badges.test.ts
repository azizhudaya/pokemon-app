import { computeMoveBadges } from "./badges";
import type { MoveInfo } from "@/types/pokemon";

function move(partial: Partial<MoveInfo>): MoveInfo {
  return {
    id: 0,
    name: "tackle",
    displayName: "Tackle",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    priority: 0,
    pp: 35,
    ...partial,
  };
}

describe("computeMoveBadges()", () => {
  it("shows a +1 badge for priority moves", () => {
    const badges = computeMoveBadges(move({ name: "quick-attack", priority: 1 }), null);
    expect(badges.map((b) => b.kind)).toContain("priority-plus");
  });

  it("shows a -6 badge for Trick Room priority", () => {
    const badges = computeMoveBadges(
      move({ name: "trick-room", priority: -7, category: "status" }),
      null,
    );
    expect(badges.some((b) => b.kind === "priority-minus")).toBe(true);
    expect(badges.some((b) => b.kind === "speed-control")).toBe(true);
  });

  it("tags Prankster on Status moves only", () => {
    const tailwind = move({ name: "tailwind", category: "status", priority: 0 });
    const withPrankster = computeMoveBadges(tailwind, "Prankster");
    expect(withPrankster.some((b) => b.kind === "prankster")).toBe(true);

    const physicalWithPrankster = computeMoveBadges(
      move({ name: "sucker-punch", category: "physical", priority: 1 }),
      "Prankster",
    );
    expect(physicalWithPrankster.some((b) => b.kind === "prankster")).toBe(false);
  });

  it("flags speed-control moves", () => {
    const icyWind = move({ name: "icy-wind", category: "special" });
    expect(computeMoveBadges(icyWind, null).some((b) => b.kind === "speed-control")).toBe(true);

    const tackle = move({ name: "tackle" });
    expect(computeMoveBadges(tackle, null)).toEqual([]);
  });
});
