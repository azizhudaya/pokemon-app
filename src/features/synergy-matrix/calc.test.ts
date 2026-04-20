import { computeSynergyMatrix, type MatrixDefender } from "./calc";

const charizard: MatrixDefender = {
  slotIndex: 0,
  speciesName: "charizard",
  types: ["fire", "flying"],
  ability: null,
  teraType: null,
};

const gyarados: MatrixDefender = {
  slotIndex: 1,
  speciesName: "gyarados",
  types: ["water", "flying"],
  ability: null,
  teraType: null,
};

const amoonguss: MatrixDefender = {
  slotIndex: 2,
  speciesName: "amoonguss",
  types: ["grass", "poison"],
  ability: null,
  teraType: null,
};

const garchomp: MatrixDefender = {
  slotIndex: 3,
  speciesName: "garchomp",
  types: ["dragon", "ground"],
  ability: null,
  teraType: null,
};

describe("computeSynergyMatrix()", () => {
  it("returns 18 columns with complete per-slot breakdown", () => {
    const result = computeSynergyMatrix([charizard, gyarados]);
    expect(result.columns).toHaveLength(18);
    for (const column of result.columns) {
      expect(column.slots).toHaveLength(2);
    }
  });

  it("computes rock matchup for Charizard and Gyarados", () => {
    const result = computeSynergyMatrix([charizard, gyarados]);
    const rock = result.columns.find((c) => c.attackingType === "rock")!;
    // Rock vs Fire/Flying (Charizard): 2 * 2 = 4
    // Rock vs Water/Flying (Gyarados): 1 * 2 = 2
    expect(rock.slots[0].multiplier).toBe(4);
    expect(rock.slots[1].multiplier).toBe(2);
    expect(rock.weakCount).toBe(2);
    expect(rock.doubleWeakCount).toBe(1);
  });

  it("applies Tera Type to override defensive types", () => {
    const teraGrass: MatrixDefender = { ...charizard, teraType: "grass" };
    const result = computeSynergyMatrix([teraGrass]);
    const rock = result.columns.find((c) => c.attackingType === "rock")!;
    // Rock vs Grass = 1x
    expect(rock.slots[0].multiplier).toBe(1);
    const fire = result.columns.find((c) => c.attackingType === "fire")!;
    // Fire vs Grass = 2x (Tera Grass takes normal damage from fire)
    expect(fire.slots[0].multiplier).toBe(2);
  });

  it("applies Levitate to grant Ground immunity", () => {
    const levitator: MatrixDefender = { ...garchomp, ability: "Levitate" };
    const result = computeSynergyMatrix([levitator]);
    const ice = result.columns.find((c) => c.attackingType === "ice")!;
    // Without ability: Dragon/Ground vs Ice = 2 * 2 = 4
    // Levitate doesn't touch Ice; still 4x
    expect(ice.slots[0].multiplier).toBe(4);
    const ground = result.columns.find((c) => c.attackingType === "ground")!;
    // Ground vs Dragon/Ground = 1 * 2 = 2 but Levitate → 0
    expect(ground.slots[0].multiplier).toBe(0);
    expect(ground.immuneCount).toBe(1);
  });

  it("a 3-way shared weakness shows in weakCount", () => {
    const result = computeSynergyMatrix([charizard, amoonguss, garchomp]);
    const ice = result.columns.find((c) => c.attackingType === "ice")!;
    // charizard: ice vs fire/flying = 0.5 * 2 = 1 (not weak)
    // amoonguss: ice vs grass/poison = 2 * 1 = 2 (weak)
    // garchomp: ice vs dragon/ground = 2 * 2 = 4 (4x weak)
    expect(ice.weakCount).toBe(2);
    expect(ice.doubleWeakCount).toBe(1);
  });
});
