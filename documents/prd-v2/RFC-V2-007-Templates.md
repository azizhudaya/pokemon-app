# RFC-V2-007: Per-Game Templates (×10 Each)

**Status:** Proposed
**Dependencies:** RFC-V2-002 (Champions dataset), RFC-V2-003 (SV dataset)
**Maps to features:** F-TM-03, F-TM-04
**Estimated size:** Medium (~1 day implementation + meta research time)

## 1. Overview

Replace the v1 hardcoded 3-5 templates with 10 hand-curated meta-archetype templates per game mode. Each template includes archetype tag, source URL, and a strategy note. Templates are scoped by game mode and lazy-loaded per route.

## 2. Goals

* 10 Champions templates and 10 SV templates (20 total).
* Each template loadable via the existing Templates modal.
* Templates filtered by current game mode.
* Template metadata (archetype, source, strategy note) surfaced in the modal UI.
* Lazy-loaded JSON to keep initial bundle small.

## 3. Non-Goals

* Live meta scraping (Won't-have per PRD §3).
* User-saved teams or custom templates (would require user accounts, also Won't-have).
* Template rating / sorting by popularity.

## 4. Technical Design

### 4.1 Template schema

```ts
// src/types/template.ts

import type { TeamSlot } from './team';
import type { GameMode } from './game-mode';

export interface TeamTemplate {
  id: string;                    // kebab-case unique
  name: string;
  archetype: string;             // "Trick Room", "Sun", "Rain", "Hyper Offense", etc.
  gameMode: GameMode;
  sourceUrl?: string;            // Pikalytics, VGCPastes, tournament VOD
  strategyNote: string;          // one-line beginner-friendly explanation
  slots: TeamSlot[];             // length 6
  snapshotDate: string;          // ISO YYYY-MM-DD; for staleness tracking
}
```

### 4.2 Data files

* `src/features/templates/champions-templates.json` — 10 entries.
* `src/features/templates/sv-templates.json` — 10 entries.
* Files imported via `import()` in the templates modal; not bundled into the initial route chunk.

### 4.3 Champions templates (research scope)

Champions released 2026-04-08; the meta is < 30 days old at v2 spec time. Sources:
* Early ranked ladder leaderboard composition (if a public API exists — verify).
* Tournament VOD analysis of the first Champions Challenge or equivalent (April 2026 events).
* High-profile creator team builds (Wolfe Glick, Aaron Zheng, etc., if they've published).

Initial 10 archetypes to target (best-effort given the early meta):
1. Mega Charizard Y Sun
2. Mega Kangaskhan Hyper Offense
3. Trick Room (Mega Mawile or Mega Camerupt anchor)
4. Mega Gardevoir Tailwind
5. Rain (Mega Swampert if listed; else generic rain core)
6. Mega Lucario Balance
7. Mega Salamence (if listed) Aerial Pressure
8. Mega Tyranitar Sand
9. Mega Metagross Bulky Offense
10. Mega Diancie (if listed) Trick Room

Each builder includes the four new-ability Megas (Mega Feraligatr/Meganium/Excadrill/Sceptile) noted as "experimental" templates if they appear in early ladder data.

### 4.4 SV templates (research scope)

SV meta is mature; sources are well-established:
* Pikalytics top-ranked teams for the active SV ruleset (Reg J or 2026 successor).
* VGCPastes archive.
* Recent regional / international tournament winners.

Initial 10 archetypes:
1. Pelipper Rain
2. Torkoal Sun
3. Tyranitar Sand
4. Trick Room (Indeedee / Farigiraf)
5. Calyrex-Shadow restricted (if active ruleset allows; otherwise standard)
6. Calyrex-Ice restricted (same)
7. Miraidon / Koraidon (same restricted note)
8. Dragapult Hyper Offense
9. Urshifu (Single/Rapid Strike) lead
10. Iron Hands / Flutter Mane bulky offense

Adjust based on the 2026 ruleset.

### 4.5 Modal UI

Update `src/features/templates/templates-modal.tsx`:
* Read `gameMode` from route.
* Lazy-load the matching template JSON: `await import(`./${gameMode}-templates.json`)`.
* Render each template as a card showing: name, archetype badge, sprite preview of the 6 Pokémon, strategy note, source link.
* "LOAD TEAM" button populates the active store via `loadTeam(slots)`.
* Confirm-overwrite prompt if active roster has any filled slot (existing v1 behavior preserved).

### 4.6 Validation on load

Defensive guard: when loading a template, validate every slot's species and item against the active game-mode dataset. If any slot references an unknown ID:
* Log a console warning with the bad slot index and field.
* Skip that field (set to `null`) but still load the rest of the team.
* Show a non-blocking notice in the modal: "Some entries were skipped due to data drift — see console."

This guards against template authoring errors and Champions roster updates that retire entries.

## 5. Acceptance Criteria

* `champions-templates.json` and `sv-templates.json` each contain 10 entries.
* Every template's `slots` is length 6.
* Every template's species and item references resolve in its declared `gameMode` dataset.
* Templates modal lazy-loads JSON (verify in network tab — JSON is in a separate chunk).
* Champions mode templates modal shows only `gameMode: 'champions'` entries.
* Each template card renders: name, archetype tag, 6 sprites, strategy note, source link (if present).
* Loading a template populates the active roster correctly (all 6 slots, items, abilities, moves, Tera Type for SV / Mega Stone for Champions).
* Bundle delta on the initial route: 0 KB (JSON is lazy-loaded; only loaded when the modal opens).

## 6. Implementation Sequence

1. Define `TeamTemplate` type in `src/types/template.ts`.
2. Research SV templates (mature meta — fastest to author). Author 10 entries in `sv-templates.json`.
3. Research Champions templates (newer meta — best-effort). Author 10 entries in `champions-templates.json`. Mark `snapshotDate` clearly so a v2.1 refresh is straightforward.
4. Update `templates-modal.tsx` with lazy-load, gameMode filter, and metadata rendering.
5. Add load-time validation with console-warn-and-skip behavior for unknown IDs.
6. Add a unit test: every template's species and item IDs resolve in its declared game mode.
7. Manual QA: load each of the 20 templates, verify analytics output looks reasonable.

## 7. Open Questions

* **Q1.** Does the active SV VGC ruleset (Reg J or successor) restrict to non-restricted Pokémon? If yes, drop the restricted archetypes (Calyrex, Miraidon/Koraidon) and replace with non-restricted alternatives. Confirm before authoring.
* **Q2.** Should templates indicate creator attribution (e.g., "by Aaron Zheng")? If sourced from a public paste, attribute via `sourceUrl`. If sourced from VOD analysis without an explicit creator-published team, attribute the tournament instead.
* **Q3.** What's the policy on templates becoming stale? E.g., a Champions template authored in April 2026 may not be meta-relevant by July 2026. Default policy: ship templates with `snapshotDate`, schedule a v2.1 refresh quarterly.
* **Q4.** Should templates be selectable across game modes if the user wants to "study" the other mode's archetypes without switching? Default: no — templates are mode-locked. Switching modes is a one-click operation; no need for cross-mode preview in v2.
