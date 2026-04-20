import { computeSynergyMatrix, type MatrixDefender } from "./calc";
import { computeWeaknessAlerts } from "@/features/weakness-alerts/calc";

describe("synergy matrix performance", () => {
  it("computes a 6-slot matrix and alerts in <50ms (Rules §3)", () => {
    const defenders: MatrixDefender[] = [
      { slotIndex: 0, speciesName: "charizard", types: ["fire", "flying"], ability: null, teraType: null },
      { slotIndex: 1, speciesName: "garchomp", types: ["dragon", "ground"], ability: "rough-skin", teraType: "steel" },
      { slotIndex: 2, speciesName: "amoonguss", types: ["grass", "poison"], ability: "regenerator", teraType: "water" },
      { slotIndex: 3, speciesName: "flutter-mane", types: ["ghost", "fairy"], ability: null, teraType: "fairy" },
      { slotIndex: 4, speciesName: "iron-hands", types: ["fighting", "electric"], ability: "quark-drive", teraType: "grass" },
      { slotIndex: 5, speciesName: "incineroar", types: ["fire", "dark"], ability: "intimidate", teraType: "ghost" },
    ];

    const start = performance.now();
    for (let i = 0; i < 100; i += 1) {
      const matrix = computeSynergyMatrix(defenders);
      computeWeaknessAlerts(matrix);
    }
    const elapsed = performance.now() - start;
    const perIteration = elapsed / 100;
    expect(perIteration).toBeLessThan(50);
  });
});
