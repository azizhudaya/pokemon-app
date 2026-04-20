import { parseShowdownTeam } from "./parser";
import { formatShowdownTeam } from "./formatter";
import type { TeamSlot } from "@/types/team";

function buildSlot(overrides: Partial<TeamSlot> = {}): TeamSlot {
  return {
    speciesId: 0,
    speciesName: "flutter-mane",
    nickname: null,
    ability: "Protosynthesis",
    item: "Booster Energy",
    teraType: "fairy",
    moves: ["moonblast", "shadow-ball", "icy-wind", "protect"],
    nature: "Timid",
    evPresetId: "custom",
    evs: { hp: 4, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 },
    level: 50,
    ...overrides,
  };
}

describe("Showdown formatter", () => {
  it("emits canonical output", () => {
    const text = formatShowdownTeam([buildSlot()]);
    expect(text).toContain("Flutter Mane @ Booster Energy");
    expect(text).toContain("Ability: Protosynthesis");
    expect(text).toContain("Tera Type: Fairy");
    expect(text).toContain("EVs: 4 HP / 252 SpA / 252 Spe");
    expect(text).toContain("Timid Nature");
    expect(text).toContain("- Moonblast");
  });

  it("omits empty slots", () => {
    const empty = buildSlot({ speciesName: null, speciesId: null });
    const text = formatShowdownTeam([buildSlot(), empty]);
    expect(text.split("\n\n")).toHaveLength(1);
  });
});

describe("Showdown parser", () => {
  it("round-trips a full slot", () => {
    const original = buildSlot();
    const exported = formatShowdownTeam([original]);
    const { slots, warnings } = parseShowdownTeam(exported);
    expect(warnings).toEqual([]);
    expect(slots).toHaveLength(1);
    const reparsed = slots[0];
    expect(reparsed.speciesName).toBe("flutter-mane");
    expect(reparsed.item).toBe("Booster Energy");
    expect(reparsed.ability).toBe("Protosynthesis");
    expect(reparsed.teraType).toBe("fairy");
    expect(reparsed.nature).toBe("Timid");
    expect(reparsed.evs).toEqual(original.evs);
    expect(reparsed.moves).toEqual(original.moves);
  });

  it("warns on unknown Tera Type but loads the rest", () => {
    const input = `Flutter Mane @ Booster Energy\nAbility: Protosynthesis\nTera Type: Plasma\n- Moonblast`;
    const { slots, warnings } = parseShowdownTeam(input);
    expect(slots).toHaveLength(1);
    expect(slots[0].teraType).toBeNull();
    expect(warnings.some((w) => w.includes("Plasma"))).toBe(true);
  });

  it("parses a Pokémon with a nickname and gender", () => {
    const input = `Sparky (Flutter Mane) (F) @ Booster Energy\nAbility: Protosynthesis\n- Moonblast`;
    const { slots } = parseShowdownTeam(input);
    expect(slots[0].speciesName).toBe("flutter-mane");
  });

  it("caps at 6 slots", () => {
    const slot = `Flutter Mane @ Focus Sash\nAbility: Protosynthesis\n- Moonblast`;
    const input = Array.from({ length: 9 }, () => slot).join("\n\n");
    const { slots } = parseShowdownTeam(input);
    expect(slots).toHaveLength(6);
  });
});
