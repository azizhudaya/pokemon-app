import { buildSpeedTierData } from "./calc";
import type { PokemonSpecies } from "@/types/pokemon";
import type { TeamSlot } from "@/types/team";

function makeSlot(overrides: Partial<TeamSlot>): TeamSlot {
  return {
    speciesId: 1,
    speciesName: "flutter-mane",
    nickname: null,
    ability: null,
    item: null,
    teraType: null,
    moves: [null, null, null, null],
    nature: "Timid",
    evPresetId: "custom",
    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 252 },
    level: 50,
    ...overrides,
  };
}

function makeSpecies(): PokemonSpecies {
  return {
    id: 987,
    name: "flutter-mane",
    displayName: "Flutter Mane",
    types: ["ghost", "fairy"],
    abilities: [],
    baseStats: {
      hp: 55,
      attack: 55,
      defense: 55,
      specialAttack: 135,
      specialDefense: 135,
      speed: 135,
    },
    spriteUrl: null,
    moves: [],
  };
}

describe("buildSpeedTierData()", () => {
  it("always includes the 8 meta threats", () => {
    const rows = buildSpeedTierData([], []);
    const meta = rows.filter((row) => row.origin === "meta");
    expect(meta).toHaveLength(8);
  });

  it("computes team speed including Choice Scarf", () => {
    const slot = makeSlot({ item: "Choice Scarf" });
    const rows = buildSpeedTierData([slot], [makeSpecies()]);
    const team = rows.find((row) => row.origin === "team");
    expect(team).toBeDefined();
    // 205 base adjusted * 1.5 = 307
    expect(team?.speed).toBe(307);
  });

  it("sorts descending by speed", () => {
    const slowSlot = makeSlot({ nature: "Hardy", evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } });
    const rows = buildSpeedTierData([slowSlot], [makeSpecies()]);
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i - 1].speed).toBeGreaterThanOrEqual(rows[i].speed);
    }
  });
});
