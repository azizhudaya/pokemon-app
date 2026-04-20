import {
  TYPE_CHART,
  applyAbilityOverrides,
  getTypeMultiplier,
} from "./type-effectiveness";
import { POKEMON_TYPES } from "@/types/pokemon";

describe("TYPE_CHART integrity", () => {
  it("defines all 18 defending types for every attacking type", () => {
    for (const attacker of POKEMON_TYPES) {
      const row = TYPE_CHART[attacker];
      for (const defender of POKEMON_TYPES) {
        expect(row[defender]).toBeDefined();
        expect([0, 0.5, 1, 2]).toContain(row[defender]);
      }
    }
  });

  it("captures canonical matchups", () => {
    expect(TYPE_CHART.fire.grass).toBe(2);
    expect(TYPE_CHART.water.fire).toBe(2);
    expect(TYPE_CHART.ground.flying).toBe(0);
    expect(TYPE_CHART.ghost.normal).toBe(0);
    expect(TYPE_CHART.normal.ghost).toBe(0);
    expect(TYPE_CHART.dragon.fairy).toBe(0);
    expect(TYPE_CHART.fairy.dragon).toBe(2);
    expect(TYPE_CHART.psychic.dark).toBe(0);
    expect(TYPE_CHART.fighting.ghost).toBe(0);
    expect(TYPE_CHART.fighting.normal).toBe(2);
  });
});

describe("getTypeMultiplier()", () => {
  it("multiplies across dual types", () => {
    // Charizard (fire/flying) vs rock-type attack: 2 * 2 = 4
    expect(getTypeMultiplier("rock", ["fire", "flying"])).toBe(4);
    // Charizard vs water: 2 * 1 = 2
    expect(getTypeMultiplier("water", ["fire", "flying"])).toBe(2);
    // Charizard vs electric: 1 * 2 = 2
    expect(getTypeMultiplier("electric", ["fire", "flying"])).toBe(2);
    // Charizard vs grass: 0.5 * 0.5 = 0.25
    expect(getTypeMultiplier("grass", ["fire", "flying"])).toBe(0.25);
  });

  it("returns 0 when any defending type is immune", () => {
    expect(getTypeMultiplier("ground", ["fire", "flying"])).toBe(0);
    expect(getTypeMultiplier("normal", ["ghost"])).toBe(0);
  });

  it("handles mono types", () => {
    expect(getTypeMultiplier("fighting", ["normal"])).toBe(2);
    expect(getTypeMultiplier("psychic", ["steel"])).toBe(0.5);
  });
});

describe("applyAbilityOverrides()", () => {
  it("grants Levitate immunity to Ground", () => {
    expect(applyAbilityOverrides(2, "ground", "Levitate")).toBe(0);
  });

  it("grants Flash Fire immunity to Fire", () => {
    expect(applyAbilityOverrides(4, "fire", "Flash Fire")).toBe(0);
  });

  it("grants Water Absorb immunity to Water", () => {
    expect(applyAbilityOverrides(1, "water", "Water Absorb")).toBe(0);
  });

  it("halves Ice and Fire for Thick Fat", () => {
    expect(applyAbilityOverrides(2, "fire", "Thick Fat")).toBe(1);
    expect(applyAbilityOverrides(2, "ice", "Thick Fat")).toBe(1);
    expect(applyAbilityOverrides(2, "water", "Thick Fat")).toBe(2);
  });

  it("is a no-op for an unknown ability", () => {
    expect(applyAbilityOverrides(2, "fire", "Overgrow")).toBe(2);
    expect(applyAbilityOverrides(2, "fire", null)).toBe(2);
  });

  it("is case-insensitive", () => {
    expect(applyAbilityOverrides(2, "ground", "levitate")).toBe(0);
    expect(applyAbilityOverrides(2, "ground", "LEVITATE")).toBe(0);
  });
});
