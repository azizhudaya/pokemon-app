# RFC-V2-002: Champions Dataset (Pokédex + Items)

**Status:** Proposed
**Dependencies:** RFC-V2-001
**Maps to features:** F-GM-02 (data layer portion), F-IT-02 (Champions side)
**Estimated size:** Medium (~1 day)

## 1. Overview

Provide the Champions-mode data layer: the species roster, the held-item catalog (hardcoded from Serebii's 2026-04-30 snapshot), and a Mega Stone → species compatibility map. Wire the Champions route's species and item pickers to use this data.

The Mega Evolution **gimmick UI and analytics** are out of scope for this RFC — see RFC-V2-006.

## 2. Goals

* Champions species picker shows only Champions-legal Pokémon.
* Champions item picker shows all 118 items from the Serebii snapshot, grouped by category.
* Mega Stone → species compatibility map exists for downstream RFC-V2-006 consumption.
* No live PokeAPI roster filtering — the legality lists are static JSON.

## 3. Non-Goals

* Mega Evolution toggle UI (RFC-V2-006).
* Mega form stat / typing / ability data (RFC-V2-006).
* SV dataset (RFC-V2-003).

## 4. Technical Design

### 4.1 New module: `src/lib/game-mode/`

Files:
* `index.ts` — barrel re-exports.
* `types.ts`:
  ```ts
  export type GameMode = 'champions' | 'sv';
  export interface GameItem {
    id: string;             // kebab-case, matches PokeAPI naming
    displayName: string;
    category: 'hold' | 'mega-stone' | 'berry';
    spriteUrl: string;
  }
  ```
* `champions-pokedex.ts` — exports `CHAMPIONS_SPECIES_IDS: ReadonlyArray<number>`. Sourced from Serebii's Champions Pokédex page (snapshot 2026-04-30). Stored as a sorted array of National Dex IDs.
* `champions-items.ts` — exports `CHAMPIONS_ITEMS: ReadonlyArray<GameItem>`. Hardcoded from the Serebii items page snapshot:
  * 30 hold items (Black Belt, Black Glasses, ..., White Herb)
  * 60 Mega Stones (Abomasite ... Victreebelite)
  * 28 berries (Aspear ... Yache Berry)
* `mega-evolution-map.ts` — exports `MEGA_STONE_TO_SPECIES: Readonly<Record<string, number[]>>`, e.g., `{ 'charizardite-x': [6], 'charizardite-y': [6], 'mewtwonite-x': [150], ... }`. The map is used by RFC-V2-006 to enable the Mega Evolve toggle conditionally; it is exported here so RFC-V2-006 doesn't need to re-import data.

### 4.2 Wiring

* `src/features/team-builder/pokemon-picker.tsx` accepts a `gameMode` prop. When `gameMode === 'champions'`, the species list is filtered to `CHAMPIONS_SPECIES_IDS` before being passed to the `<SearchableSelect>` (RFC-V2-004).
* Item picker (currently part of `roster-slot.tsx`) gains the same `gameMode` prop. The list source switches between `CHAMPIONS_ITEMS` and the SV item list (RFC-V2-003).
* In Champions mode, items are pre-grouped: Hold Items, Mega Stones, Berries. Group headers render as non-selectable separators in the dropdown. Filtering by search retains the headers as long as the group has matches.

### 4.3 Sprite resolution

* PokeAPI sprite URLs follow predictable patterns:
  * Items: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{id}.png`
  * Mega Stones use the same path.
* `champions-items.ts` stores only `id`; `spriteUrl` is computed via a helper, not hardcoded per item.

## 5. Data Snapshot (2026-04-30)

The full Champions item list is in PRD §3 / Serebii. For this RFC, the authoritative source-of-truth is the `champions-items.ts` file written from the Serebii fetch. Reviewers should cross-check the file against [Serebii's Champions items page](https://www.serebii.net/pokemonchampions/items.shtml) at PR time.

The Champions Pokédex must be similarly captured. Serebii has not published a clean enumeration — the team must:
1. Pull the Champions Pokédex page (https://www.serebii.net/pokemonchampions/pokedex.shtml or equivalent).
2. Extract the National Dex IDs.
3. Cross-reference with Pokémon Champions Bulbapedia entry for any DLC-only inclusions.
4. Commit the final list to `champions-pokedex.ts` with a comment noting the snapshot date and source URLs.

## 6. Acceptance Criteria

* `CHAMPIONS_SPECIES_IDS` is non-empty and matches the Serebii snapshot.
* `CHAMPIONS_ITEMS` has exactly 118 entries (30 + 60 + 28).
* Champions species picker hides species not in `CHAMPIONS_SPECIES_IDS`.
* Champions item picker shows the full 118-entry catalog, grouped by category.
* SV mode (RFC-V2-003 territory) is unaffected.
* No PokeAPI calls are made specifically for legality filtering — the lists are static.
* Bundle delta: < 10 KB gzipped (snapshot lists are small JSON).

## 7. Implementation Sequence

1. Fetch Serebii items page; produce `champions-items.ts` from the structured WebFetch result already captured during PRD authoring.
2. Fetch Serebii Champions Pokédex; produce `champions-pokedex.ts`.
3. Author `mega-evolution-map.ts` from the 60 Mega Stones list, mapping each stone to its target species' National Dex ID(s). Use Bulbapedia or Serebii's Mega Evolution page for accuracy.
4. Add `gameMode` prop to species picker and item picker. Filter species/items based on the prop.
5. Wire item grouping in the Champions item picker.
6. Add a snapshot test asserting category counts (30 / 60 / 28).
7. Add a unit test asserting that every key in `MEGA_STONE_TO_SPECIES` exists in `CHAMPIONS_ITEMS` with `category: 'mega-stone'`.

## 8. Open Questions

* **Q1.** Confirm that Mega Charizard X and Y (and Mewtwo X/Y) share a species ID — the map should resolve to `[6]` and `[150]` regardless of which stone, since the species toggle is on stone, not species.
* **Q2.** Are there any items in Serebii's "Misc" category that we should *include* despite the user's "exclude misc" instruction? E.g., if Omni Ring is filed under misc but is required for Mega Evolution, it might need to be carved out as a per-team-level item rather than a slot item — flag for product review.
* **Q3.** Should the Mega Stone group be visually accented (e.g., glowing border) to telegraph that it enables a slot-level gimmick? Not a P0; mention in RFC-V2-006 polish phase.
