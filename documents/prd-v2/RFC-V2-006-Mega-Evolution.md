# RFC-V2-006: Mega Evolution Gimmick & Analytics Integration

**Status:** Proposed
**Dependencies:** RFC-V2-002 (provides `MEGA_STONE_TO_SPECIES` map and Champions item set)
**Maps to features:** F-GM-02 (gimmick UI portion), F-MG-01
**Estimated size:** Large (~2.5 days)

## 1. Overview

Add the per-slot "Mega Evolve" toggle in Champions mode, store the toggle state in the team store, encode the per-Mega-form data (typing, ability, stat deltas), and thread the override through the existing analytics math layer so that synergy matrix, damage category, weakness alerts, and speed-tier visualizer compute against the Mega form when the toggle is on.

## 2. Goals

* Mega Evolve toggle appears on a slot only when a compatible Mega Stone is held.
* Toggling it on flips the slot's effective typing, ability, and stats to the Mega form.
* Analytics output reflects the Mega form within 50ms.
* Soft warning on the second Mega-toggled slot ("Only one Mega Evolution per battle").

## 3. Non-Goals

* Hard legality enforcement (multiple Mega-capable Pokémon are *legal* to register; only one can Mega-evolve per battle, which is a UX hint, not a blocker).
* New Mega-form Pokémon icons (use existing PokeAPI sprites or a known Mega sprite endpoint).
* SV mode behavior (no Mega in SV — explicitly hidden).

## 4. Technical Design

### 4.1 Mega-form data table

New file: `src/lib/game-mode/mega-forms.ts`:

```ts
export interface MegaForm {
  speciesId: number;          // base form national dex ID
  megaStoneId: string;        // matches CHAMPIONS_ITEMS id
  megaSpriteUrl: string;      // PokeAPI mega sprite or Bulbapedia mirror
  types: [PokemonType, PokemonType?];   // post-Mega typing
  ability: string;            // post-Mega ability (Drought, Tough Claws, Dragonize, etc.)
  baseStats: BaseStats;       // post-Mega base stats; HP unchanged from base form
  bstDelta: 100;              // enforced invariant
  notes?: string;             // e.g., "Mega Charizard X — Fire/Dragon"
}

export const MEGA_FORMS: ReadonlyArray<MegaForm> = [
  // 60 entries matching the 60 Mega Stones in CHAMPIONS_ITEMS
];
```

Source: Bulbapedia per-Pokémon Mega Evolution pages, cross-referenced with Serebii's [Champions Mega Abilities page](https://www.serebii.net/pokemonchampions/megaabilities.shtml) for the four new abilities (Dragonize, Mega Sol, Piercing Drill, Spicy Spray).

### 4.2 Slot state extension

`TeamSlot.megaEvolved: boolean` (already added in RFC-V2-001 as an optional field). Set via a new action:

```ts
setMegaEvolved: (index: number, value: boolean) => void;
```

Resets to `false` when:
* Species changes (slot reset, existing behavior).
* Item changes to a non-Mega-Stone item.

### 4.3 Per-slot UI (Champions only)

In `roster-slot.tsx`:
* When `gameMode === 'champions'` AND `slot.item` is a Mega Stone AND the species is compatible (lookup via `MEGA_STONE_TO_SPECIES`):
  * Render a "MEGA EVOLVE" toggle (styled as a switch with terminal aesthetic).
  * Toggle binds to `slot.megaEvolved`.
* When the species is incompatible with the held Mega Stone (e.g., Charizardite Y on Garchomp), the toggle does **not** render and a small note ("Stone incompatible") appears. *Not* a block — the user might be exploring.
* In SV mode, the toggle is unconditionally hidden.

### 4.4 One-Mega-per-team soft warning

* In `<TeamBuilder>` header (Champions mode only): if `roster.filter(s => s.megaEvolved).length > 1`, render a warning banner ("⚠ Only one Mega Evolution per battle — disable extras for accurate analytics").
* Computed via a Zustand selector; doesn't block actions.

### 4.5 Analytics integration

Extend the analytics math layer. The existing functions in `src/lib/type-effectiveness.ts` and `src/lib/stat-calc.ts` already accept a slot-derived input; introduce a transform that returns the *effective* slot view:

```ts
// src/lib/game-mode/effective-slot.ts

export interface EffectiveSlot {
  speciesId: number;
  types: [PokemonType, PokemonType?];
  ability: string | null;
  baseStats: BaseStats;
  // ... other fields used by analytics
}

export function getEffectiveSlot(slot: TeamSlot, gameMode: GameMode): EffectiveSlot {
  if (gameMode === 'champions' && slot.megaEvolved && slot.item) {
    const mega = MEGA_FORMS.find((m) => m.megaStoneId === slot.item && m.speciesId === slot.speciesId);
    if (mega) return { ...baseSlotView(slot), types: mega.types, ability: mega.ability, baseStats: mega.baseStats };
  }
  return baseSlotView(slot);
}
```

* Every analytics consumer (synergy matrix, damage category, speed tier, weakness alerts) calls `getEffectiveSlot(slot, gameMode)` instead of reading the raw slot.
* This is the *only* analytics-layer change. The math itself does not change.

### 4.6 New abilities edge cases

The four new abilities introduced for Champions Megas:

* **Dragonize** (Mega Feraligatr): Normal moves become Dragon-type with +20% power. Damage-category logic is unaffected (still Physical/Special based on move). Could affect analytics surfaces in v2.1 (e.g., showing the team has hidden Dragon coverage), but no math change in v2.
* **Mega Sol** (Mega Meganium): Pokémon's moves act as if weather were harsh sunlight. No analytics impact in v2 (we don't model weather).
* **Piercing Drill** (Mega Excadrill): Contact moves bypass Protect for 25% damage. No v2 impact (we don't model Protect).
* **Spicy Spray** (Mega Sceptile, per latest data): Effect TBD per Serebii. Treat as a labeled string in the UI; no math impact in v2.

These abilities are recorded in `MEGA_FORMS[].ability` as their literal name; analytics treats them as opaque labels for v2. Future RFCs can add ability-aware logic.

## 5. Acceptance Criteria

* Mega Evolve toggle appears in Champions mode when species + Mega Stone are compatible.
* Toggle is hidden in SV mode regardless of state.
* Toggling on: synergy matrix, damage category, weakness alerts, and speed-tier visualizer all reflect the Mega form within 50ms.
* Toggling off: analytics revert to base form within 50ms.
* Changing species or item resets `megaEvolved` to `false`.
* Soft warning banner appears when 2+ slots have `megaEvolved === true`.
* `MEGA_FORMS` covers all 60 Mega Stones in `CHAMPIONS_ITEMS`.
* Every entry in `MEGA_FORMS` satisfies the BST +100 invariant (HP unchanged).
* Type chart covers Mega forms with new typings (e.g., Charizard becoming Fire/Dragon as Mega X).

## 6. Implementation Sequence

1. Author `MEGA_FORMS` table from Bulbapedia + Serebii sources. Include all 60 entries.
2. Add a build-time test: every entry's `bstDelta === 100`, every entry's `megaStoneId` exists in `CHAMPIONS_ITEMS`.
3. Implement `getEffectiveSlot()` and unit-test with: base slot (no Mega Stone), Mega Stone but toggle off, Mega Stone + toggle + compatible species, Mega Stone + toggle + incompatible species (returns base, not Mega).
4. Add `setMegaEvolved` action to the store factory; ensure species/item changes reset it.
5. Wire the toggle UI in `roster-slot.tsx` (Champions branch only).
6. Update analytics consumers to call `getEffectiveSlot()`. Audit list:
   * `src/features/synergy-matrix/`
   * `src/features/damage-category/`
   * `src/features/weakness-alerts/`
   * `src/features/speed-tier/`
7. Add the one-Mega-per-team warning banner.
8. Visual + functional QA: build a test team with Mega Charizard Y, verify Drought-driven typing reads correctly in synergy matrix.

## 7. Open Questions

* **Q1.** Mega sprites: PokeAPI has Mega forms under `pokemon-form` endpoints (e.g., `charizard-mega-y`). Do we use those URLs directly, or a curated mirror? Default: PokeAPI form sprites at request time, fall back to base-form sprite with a Mega badge if the form sprite 404s.
* **Q2.** Mega forms with new abilities — should the ability dropdown for the slot's *base* form continue to show only base-form abilities? Yes — `slot.ability` is the *base* ability; the Mega ability is implicit and shown as read-only metadata when toggled.
* **Q3.** Do we surface the Mega form's stat changes anywhere? E.g., "Mega Charizard Y: +30 Sp.Atk, +20 Speed". Not a P0 — speed-tier visualizer reflects the new Speed implicitly. Add a tooltip in v2.1 if requested.
* **Q4.** Mega Mewtwo X vs. Y, Mega Charizard X vs. Y — the slot's `megaStoneId` disambiguates. Confirm the UI clearly indicates which Mega form is active when the toggle is on (e.g., show "Mega Charizard Y" in the slot header).
