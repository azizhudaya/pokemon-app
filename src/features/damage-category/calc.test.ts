import { computeDamageCategoryBreakdown } from "./calc";
import type { MoveInfo } from "@/types/pokemon";

function move(
  name: string,
  category: "physical" | "special" | "status",
): MoveInfo {
  return {
    id: 0,
    name,
    displayName: name,
    type: "normal",
    category,
    power: 0,
    accuracy: 100,
    priority: 0,
    pp: 10,
  };
}

describe("computeDamageCategoryBreakdown()", () => {
  it("flags 100% physical skew", () => {
    const result = computeDamageCategoryBreakdown([
      move("close-combat", "physical"),
      move("earthquake", "physical"),
      move("stone-edge", "physical"),
    ]);
    expect(result.skew).toBe("physical");
    expect(result.physical).toBe(3);
    expect(result.special).toBe(0);
    expect(result.warning).toContain("Physical");
  });

  it("flags 100% special skew", () => {
    const result = computeDamageCategoryBreakdown([
      move("moonblast", "special"),
      move("thunderbolt", "special"),
    ]);
    expect(result.skew).toBe("special");
    expect(result.warning).toContain("Special");
  });

  it("is balanced when mixed", () => {
    const result = computeDamageCategoryBreakdown([
      move("close-combat", "physical"),
      move("thunderbolt", "special"),
      move("knock-off", "physical"),
    ]);
    expect(result.skew).toBe("balanced");
    expect(result.warning).toBeNull();
  });

  it("signals status-only rosters", () => {
    const result = computeDamageCategoryBreakdown([
      move("spore", "status"),
      move("rage-powder", "status"),
    ]);
    expect(result.skew).toBe("status");
  });

  it("handles empty roster", () => {
    const result = computeDamageCategoryBreakdown([]);
    expect(result.skew).toBe("empty");
    expect(result.totalMoves).toBe(0);
  });

  it("reclassifies Body Press as physical", () => {
    // PokéAPI lists Body Press as "physical" already; our override keeps it.
    const result = computeDamageCategoryBreakdown([
      move("body-press", "physical"),
      move("moonblast", "special"),
    ]);
    expect(result.physical).toBe(1);
    expect(result.special).toBe(1);
  });
});
