# RFC-V2-003: Scarlet/Violet Dataset (Pokédex + Items)

**Status:** Proposed
**Dependencies:** RFC-V2-001
**Maps to features:** F-GM-03, F-IT-02 (SV side)
**Estimated size:** Small (~0.5 day)

## 1. Overview

Provide the SV-mode data layer: the SV/Indigo Disk Pokédex roster, and the held-item-eligible item catalog derived from PokeAPI at build time. Wire the SV route's species and item pickers to use this data. Preserve v1 Terastalization UI exactly.

## 2. Goals

* SV species picker shows only SV-legal Pokémon (Paldea + Kitakami + Indigo Disk + Home transfer-allowed).
* SV item picker shows the held-item-eligible PokeAPI subset, **excluding** Mega Stones and Omni Ring.
* v1 analytics output is byte-identical for migrated v1 teams.

## 3. Non-Goals

* Game-mode toggling (RFC-V2-001).
* Champions dataset (RFC-V2-002).

## 4. Technical Design

### 4.1 SV Pokédex
* New file: `src/lib/game-mode/sv-pokedex.ts` — exports `SV_SPECIES_IDS: ReadonlyArray<number>`.
* Source: Bulbapedia's Paldea Pokédex + Indigo Disk Pokédex pages, plus Home-transfer legality (consult the official VGC ruleset for the current season — at v2 spec time, the active SV ruleset should be Reg I or its 2026 successor).
* Snapshot date: commit with a comment noting the source URLs and snapshot date.

### 4.2 SV Items
* New file: `src/lib/game-mode/sv-items.ts` — exports `SV_ITEMS: ReadonlyArray<GameItem>`.
* Build-time derivation: a small Node script in `scripts/build-sv-items.ts` calls PokeAPI `/api/v2/item?limit=2200`, filters by `held-by-pokemon` length > 0 and category in an allowlist, and writes the JSON to `sv-items.ts`. Run manually when refreshing the snapshot; not part of `next build`.
* Allowlist categories (PokeAPI taxonomy): `held-items`, `picky-healing`, `type-enhancement`, `bad-held-items`, `choice`, `mega-stones` (excluded post-filter), `effort-training`, `species-specific` (case-by-case), `stat-boosts`, `held-items`, `type-protection`, `medicine`, `flutes` (excluded), `apricorn-balls` (excluded), `loot` (excluded).
* Post-filter: drop any item whose ID is in the Champions-only Mega Stone set (cross-reference `MEGA_STONE_TO_SPECIES` keys from RFC-V2-002). Drop the Omni Ring if it appears.
* Berries are included.

### 4.3 Wiring
* SV route's `<BuilderShell gameMode="sv">` passes `gameMode='sv'` down to species and item pickers.
* Tera Type controls remain rendered in SV mode (as per v1, no change).
* Item grouping in SV mode is optional — sort by category alphabetically, no group headers required (since there's no special category like Mega Stones).

## 5. Acceptance Criteria

* `SV_SPECIES_IDS` is non-empty and matches the snapshot.
* `SV_ITEMS` does not contain any entry whose `id` is also a Champions Mega Stone.
* `SV_ITEMS` does not contain Omni Ring.
* SV species picker hides any species not in `SV_SPECIES_IDS`.
* SV item picker shows the full SV held-item-eligible set.
* Tera Type selector renders in SV mode unchanged from v1.
* Mega Evolution toggle is **never** rendered in SV mode (negative test).
* For a v1 team migrated to SV mode, all analytics produce identical output (byte-level diff against v1 reference).

## 6. Implementation Sequence

1. Author `sv-pokedex.ts` with the SV/Indigo Disk roster; commit snapshot date.
2. Write `scripts/build-sv-items.ts` to fetch and filter PokeAPI items.
3. Run the script; commit `sv-items.ts` as a generated file with a header comment noting the regeneration command.
4. Add `gameMode='sv'` filtering to species and item pickers (mirror RFC-V2-002 prop wiring).
5. Add a regression test: load a known v1 team into SV mode, snapshot analytics output, compare against a baseline captured pre-v2.
6. Verify Tera Type UI is untouched (visual regression test if available, otherwise manual screenshot diff).

## 7. Open Questions

* **Q1.** What's the active VGC SV ruleset in late April 2026? Reg I expired in early 2026; the current set (Reg J or successor) determines roster legality. Confirm with VGC tournament resources before locking the roster snapshot.
* **Q2.** Are there SV-specific items not surfaced by PokeAPI's `held-by-pokemon` flag (e.g., Booster Energy)? Audit by sampling top-5 ranked SV teams from Pikalytics and verifying every held item appears in `SV_ITEMS`.
* **Q3.** Should the SV item picker also group by category (Berries, Choice items, Defensive, etc.) for parity with Champions mode? Default: no, but reconsider if the flat list exceeds 250 entries and is hard to scan even with search.
