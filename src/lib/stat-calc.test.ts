import {
  applyItemSpeedModifier,
  calculateHp,
  calculateStat,
  computeFinalStats,
  natureMultiplierFor,
} from "./stat-calc";

describe("natureMultiplierFor()", () => {
  it("applies +10%/-10% correctly", () => {
    expect(natureMultiplierFor("Adamant", "attack")).toBeCloseTo(1.1);
    expect(natureMultiplierFor("Adamant", "specialAttack")).toBeCloseTo(0.9);
    expect(natureMultiplierFor("Adamant", "speed")).toBeCloseTo(1.0);
  });

  it("is neutral for Hardy", () => {
    expect(natureMultiplierFor("Hardy", "attack")).toBeCloseTo(1.0);
    expect(natureMultiplierFor("Hardy", "speed")).toBeCloseTo(1.0);
  });
});

describe("calculateHp()", () => {
  it("matches canonical Lv50 examples", () => {
    // Blissey: base HP 255, 0 EV, 31 IV, Lv50
    // floor((2*255 + 31 + 0) * 50/100) + 50 + 10 = 270 + 60 = 330
    expect(calculateHp(255, 0, 50)).toBe(330);
    // Flutter Mane: base HP 55, 0 EV, 31 IV, Lv50
    // floor((2*55 + 31 + 0) * 50/100) + 50 + 10 = 70 + 60 = 130
    expect(calculateHp(55, 0, 50)).toBe(130);
    // Flutter Mane with 252 HP EV, 31 IV, Lv50
    // floor((110 + 31 + 63) * 50/100) + 60 = 102 + 60 = 162
    expect(calculateHp(55, 252, 50)).toBe(162);
  });
});

describe("calculateStat()", () => {
  it("matches canonical Lv50 attack calc", () => {
    // Iron Hands: base Attack 140, 252 EV, Adamant (1.1) at Lv50
    // floor((2*140 + 31 + 63) * 50 / 100 + 5) = floor(187 + 5) = 192; * 1.1 = 211
    expect(calculateStat(140, 252, 50, 1.1)).toBe(211);
  });

  it("Flutter Mane max Speed with Timid at Lv50", () => {
    // base 135, 252 EV, Timid (1.1 Speed) at Lv50 -> 205
    expect(calculateStat(135, 252, 50, 1.1)).toBe(205);
  });

  it("returns base-only floor when EV and nature neutral", () => {
    // base 100, 0 EV, neutral nature, Lv50
    // floor((200 + 31) * 50 / 100 + 5) = floor(120.5) = 120; * 1.0 = 120
    expect(calculateStat(100, 0, 50, 1.0)).toBe(120);
  });
});

describe("computeFinalStats()", () => {
  it("produces a full stat line", () => {
    const base = {
      hp: 100,
      attack: 120,
      defense: 70,
      specialAttack: 80,
      specialDefense: 60,
      speed: 110,
    };
    const evs = {
      hp: 4,
      attack: 252,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 252,
    };
    const stats = computeFinalStats(base, evs, "Adamant", 50);
    expect(stats.attack).toBeGreaterThan(stats.specialAttack);
    expect(stats.hp).toBeGreaterThanOrEqual(155);
  });
});

describe("applyItemSpeedModifier()", () => {
  it("1.5x for Choice Scarf", () => {
    expect(applyItemSpeedModifier(200, "Choice Scarf")).toBe(300);
  });

  it("0.5x for Iron Ball", () => {
    expect(applyItemSpeedModifier(200, "Iron Ball")).toBe(100);
  });

  it("no change for unknown or null items", () => {
    expect(applyItemSpeedModifier(200, "Leftovers")).toBe(200);
    expect(applyItemSpeedModifier(200, null)).toBe(200);
  });
});
