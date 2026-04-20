import { computeSynergyMatrix, type MatrixDefender } from "@/features/synergy-matrix/calc";
import { computeWeaknessAlerts } from "./calc";

function defender(
  slotIndex: number,
  types: MatrixDefender["types"],
  name = `pokemon-${slotIndex}`,
): MatrixDefender {
  return {
    slotIndex,
    speciesName: name,
    types,
    ability: null,
    teraType: null,
  };
}

describe("computeWeaknessAlerts()", () => {
  it("flags a 3-way shared weakness", () => {
    // 3 fighting-weak types share normal/ice/dark body
    const defenders = [
      defender(0, ["normal"]),
      defender(1, ["ice"]),
      defender(2, ["dark"]),
    ];
    const matrix = computeSynergyMatrix(defenders);
    const alerts = computeWeaknessAlerts(matrix);
    const fighting = alerts.find((a) => a.attackingType === "fighting");
    expect(fighting).toBeDefined();
    expect(fighting?.count).toBe(3);
    expect(fighting?.slotIndices).toEqual([0, 1, 2]);
  });

  it("escalates severity to critical on 4× weaknesses", () => {
    const defenders = [
      defender(0, ["grass", "ground"]),
      defender(1, ["bug", "steel"]),
      defender(2, ["grass", "ground"]),
    ];
    const matrix = computeSynergyMatrix(defenders);
    const alerts = computeWeaknessAlerts(matrix);
    const fire = alerts.find((a) => a.attackingType === "fire");
    expect(fire?.severity).toBe("critical");
  });

  it("returns empty when the team is diverse", () => {
    const defenders = [
      defender(0, ["water"]),
      defender(1, ["fire"]),
      defender(2, ["grass"]),
    ];
    const matrix = computeSynergyMatrix(defenders);
    const alerts = computeWeaknessAlerts(matrix);
    expect(alerts).toEqual([]);
  });
});
