# FEATURES.md
# Feature List: VGC Analyzer v2

**Source PRD:** `documents/prd-v2/PRD.md` (v2.0, 2026-04-30)
**Scope:** Net-new and modified features only. v1 features (`documents/Features.md`) carry forward unchanged unless explicitly listed under "Modified" below.

## 1. Summary of Features

**By Priority (MoSCoW):**
* **Must Have:** 7 features
* **Should Have:** 2 features
* **Could Have:** 2 features
* **Won't Have:** 6 features (carried from v1 + 2 new exclusions)

**By Category:**
* **[GM] Game Mode & Routing:** 3 features
* **[DI] Data & Infrastructure:** 2 features
* **[IT] Items:** 1 feature
* **[SR] Search & Selectors:** 1 feature
* **[LO] Layout:** 2 features
* **[MG] Mega Evolution:** 1 feature
* **[TM] Templates:** 2 features
* **[OS] Out of Scope:** 6 features

**Summary Table**

| ID | Feature | Priority | Category |
|----|---------|----------|----------|
| F-GM-01 | Game-mode routing & top-level toggle | Must | Game Mode |
| F-GM-02 | Champions-mode dataset & gimmick wiring | Must | Game Mode |
| F-GM-03 | Scarlet/Violet-mode dataset & gimmick | Must | Game Mode |
| F-DI-02 | Per-game store factory & persist isolation | Must | Data & Infrastructure |
| F-DI-03 | v1 → v2 persistence migration | Must | Data & Infrastructure |
| F-IT-02 | Complete held-item catalog per game | Must | Items |
| F-SR-01 | Searchable selectors (debounce + highlight) | Must | Search |
| F-LO-01 | Adaptive 3-column roster grid | Must | Layout |
| F-LO-02 | Sidebar auto-collapse on small viewports | Should | Layout |
| F-MG-01 | Mega Evolution analytics integration | Should | Mega Evolution |
| F-TM-03 | 10 curated meta templates per game | Could | Templates |
| F-TM-04 | Template archetype metadata | Could | Templates |

---

## 2. Detailed Feature Breakdown

### Category: Game Mode & Routing [GM]

**F-GM-01: Game-Mode Routing & Top-Level Toggle**
* **Description:** Two distinct routes (`/champions` default, `/scarlet-violet`) each rendering an isolated builder. Header-level segmented toggle navigates between them.
* **Persona:** Champions Convert, Scarlet/Violet Loyalist, VGC Curious Beginner
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Visiting `/` redirects to `/champions`.
  * Header shows `CHAMPIONS | SCARLET/VIOLET` toggle; the active route is visually emphasized.
  * Switching routes preserves both rosters independently (no overwrite, no merge).
  * Browser back/forward navigation between modes works correctly.
  * Each route renders the same `<TeamBuilder />` and `<AnalyticsColumn />` shell, parameterized by `gameMode`.
* **Technical Considerations:** Next.js App Router static export. Use `<Link>` with `prefetch` for instant mode switches. The `gameMode` is derived from route segment (no prop drilling beyond the route boundary).
* **Edge Cases:** Direct deep-link to `/scarlet-violet` on first visit must not redirect; only bare `/` redirects.
* **Complexity:** Low

**F-GM-02: Champions-Mode Dataset & Gimmick Wiring**
* **Description:** In Champions mode, species picker filters to Champions-legal Pokémon, item list comes from the hardcoded Champions catalog, and the per-slot gimmick UI is **Mega Evolution** (not Tera Type).
* **Persona:** Champions Convert
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Species picker shows only species in `champions-pokedex.ts`.
  * Item picker shows only items in `champions-items.ts` (30 hold + 60 Mega Stones + 28 berries).
  * Each slot shows a "Mega Evolve" toggle when a compatible Mega Stone is held; the toggle is hidden otherwise.
  * Toggling Mega Evolve updates the slot's effective typing, ability, and stats per `mega-evolution-map.ts`.
  * Tera Type controls are **not** rendered in Champions mode.
  * One-Mega-per-team soft warning appears on the second Mega-toggled slot.
* **Technical Considerations:** Mega form data (typing, ability, stat deltas) hardcoded; do not fetch dynamically. Validate BST +100 rule at map authoring time, not runtime.
* **Edge Cases:** Mega Stone held but species not compatible (e.g., Charizardite Y on Pikachu) — toggle is hidden. Two Mega Stones held across the team — soft warning, not a block.
* **Complexity:** High

**F-GM-03: Scarlet/Violet-Mode Dataset & Gimmick**
* **Description:** SV mode preserves v1 Terastalization UI exactly. Species picker filters to SV/Indigo Disk Pokédex; item list excludes Mega Stones and Omni Ring.
* **Persona:** Scarlet/Violet Loyalist
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Species picker shows only species in `sv-pokedex.ts`.
  * Item picker shows the SV-appropriate held-item-eligible set (no Mega Stones, no Omni Ring).
  * Tera Type selector is rendered exactly as in v1.
  * Mega Evolution UI is **not** rendered in SV mode.
  * v1 analytics output is byte-identical for migrated v1 teams (regression guarantee).
* **Technical Considerations:** SV pokedex list hardcoded from official sources; PokeAPI provides held-item flags but the curated SV item list is the source of truth.
* **Edge Cases:** None significant.
* **Complexity:** Medium

### Category: Data & Infrastructure [DI]

**F-DI-02: Per-Game Store Factory & Persist Isolation**
* **Description:** Replace the single `useTeamStore` with a factory `createTeamStore(gameMode)` returning a Zustand store with a mode-specific persist key. Two singletons exported (`useChampionsTeamStore`, `useSvTeamStore`); one composite hook (`useActiveTeamStore`) returns the right store based on the current route.
* **Persona:** System
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Two distinct localStorage keys exist: `vgc-analyzer:team:champions` and `vgc-analyzer:team:sv`.
  * Mutations in one mode never affect the other mode's persisted state.
  * `useActiveTeamStore()` returns the correct store on route change without React tree remount.
  * `TeamSlot` type gains an optional `megaEvolved: boolean` field, ignored in SV mode.
* **Technical Considerations:** Zustand factory pattern with `persist` middleware; pass `name` parameter dynamically. Avoid the temptation to merge into one store with a `gameMode` discriminator — separate stores keep persistence isolation simple.
* **Edge Cases:** SSR — both stores hydrate independently; ClientOnly wrapper still required.
* **Complexity:** Medium

**F-DI-03: v1 → v2 Persistence Migration**
* **Description:** On first load of v2, detect the v1 `vgc-analyzer:team` localStorage key and migrate its contents to `vgc-analyzer:team:sv` (since v1 was effectively SV-flavored). Run once, then delete the legacy key.
* **Persona:** Returning v1 user
* **Priority:** Must Have
* **Acceptance Criteria:**
  * On first load post-deploy, if `vgc-analyzer:team` exists and `vgc-analyzer:team:sv` does not, copy contents into the SV key.
  * Delete `vgc-analyzer:team` after successful copy.
  * Migration is idempotent: second load is a no-op.
  * Migration runs synchronously before the SV store hydrates from localStorage.
  * v1 teams render byte-identically in SV mode after migration (regression guarantee tied to F-GM-03).
* **Technical Considerations:** Use Zustand's `migrate` callback with `version: 2`, OR run a one-shot migration in a top-level effect before mounting stores. The latter is simpler given two-store architecture.
* **Edge Cases:** Corrupted v1 data (invalid JSON) — log to console, skip migration, leave v2 SV store empty. User starts fresh; no crash.
* **Complexity:** Low

### Category: Items [IT]

**F-IT-02: Complete Held-Item Catalog Per Game**
* **Description:** Replace v1's curated item subset. Champions mode: hardcoded list from Serebii (2026-04-30) — 30 hold items + 60 Mega Stones + 28 berries (excludes misc). SV mode: PokeAPI items where `held-by-pokemon` is non-empty in SV, plus berries, minus any Champions-only items.
* **Persona:** All users
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Champions item picker shows all 118 entries from `champions-items.ts`.
  * SV item picker shows the held-item-eligible PokeAPI subset (estimated 200-300 entries).
  * Items are grouped or filterable by category (Hold Items, Mega Stones, Berries) at minimum in Champions mode.
  * Each item entry includes: display name, sprite (PokeAPI URL), and category tag.
* **Technical Considerations:** Champions list is the snapshot from Serebii's items page. SV list is derived from PokeAPI's `/api/v2/item?limit=2200` filtered by `held-by-pokemon` length > 0; this filter runs at build time, not runtime, and produces a static JSON.
* **Edge Cases:** Items with multiple form variants (e.g., region-specific items) — include the canonical form only.
* **Complexity:** Medium

### Category: Search & Selectors [SR]

**F-SR-01: Searchable Selectors with Debounce + Highlight**
* **Description:** Every selector in the app with more than 5 options becomes a searchable combobox. Substring matches in option labels are highlighted. Filter input is debounced at 300ms.
* **Persona:** All users (especially Search-Allergic Mobile User)
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Selectors with ≤ 5 options retain the simple `<Select>` (no search needed).
  * Selectors with > 5 options use the new `<SearchableSelect>`.
  * Search input filters options by case-insensitive substring match against display name.
  * Matched substring is rendered with `<mark>` (visually distinguished by both color and font weight).
  * Filter recomputes 300ms after the last keystroke.
  * Keyboard navigation: `↑/↓` move highlight, `Enter` selects, `Esc` closes, focus is trapped inside the open dropdown.
  * ARIA: `role="combobox"`, `aria-expanded`, `aria-activedescendant` on input; `role="listbox"` and `role="option"` on dropdown.
  * Search recompute completes in < 50ms for 1,000+ option lists.
* **Technical Considerations:** Single `<SearchableSelect>` component used for: species, items, moves, abilities, Tera Type (SV only — 18 options qualify > 5), EV presets, templates. Substring match is a pure function in `src/lib/search/substring-match.ts` returning matched ranges; `<HighlightedText>` renders them.
* **Edge Cases:** Empty search returns the full list (sorted as before). No matches displays "No results" with a clear-search affordance. Special characters in search input (`%`, `_`, regex chars) are treated as literal substrings.
* **Complexity:** High

### Category: Layout [LO]

**F-LO-01: Adaptive 3-Column Roster Grid**
* **Description:** When `useUiStore.analyticsHidden === true`, the team builder roster grid switches from 2 columns to 3 columns at the desktop breakpoint.
* **Persona:** Desktop power user (focused build mode)
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Analytics visible: roster uses `grid-cols-1 xl:grid-cols-2` (current v1 layout).
  * Analytics hidden: roster uses `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`.
  * Transition is instant on toggle (no animation required).
  * All 6 slots fit on one screen at 1440px+ width when collapsed.
* **Technical Considerations:** Class derivation in `src/features/team-builder/team-builder.tsx` using existing `useUiStore` hook. No new state required.
* **Edge Cases:** Slot reorder via drag-and-drop (if added later) must work in both layouts.
* **Complexity:** Low

**F-LO-02: Sidebar Auto-Collapse on Small Viewports**
* **Description:** Below the `lg` breakpoint, analytics panel is collapsed by default on first mount. User can manually re-expand. Distinguishes user-collapsed state from viewport-driven collapse.
* **Persona:** Mobile user, tablet user
* **Priority:** Should Have
* **Acceptance Criteria:**
  * On first mount with viewport width < `lg` breakpoint, `analyticsHidden` initializes to `true`.
  * `useUiStore` adds `analyticsAutoCollapsedByViewport: boolean` to track responsive vs. user-driven state.
  * Resizing the viewport above `lg` does not auto-expand if the user has manually collapsed.
  * Resizing below `lg` from above `lg` auto-collapses unless user explicitly chose to keep it open.
* **Technical Considerations:** Use `matchMedia` listener inside a top-level effect. Avoid hydration mismatch: initialize on client, default to expanded server-side.
* **Edge Cases:** Rapid viewport resize (e.g., devtools toggling) should not flicker. Debounce the resize handler at 150ms.
* **Complexity:** Medium

### Category: Mega Evolution [MG]

**F-MG-01: Mega Evolution Analytics Integration**
* **Description:** When a slot's "Mega Evolve" toggle is on, analytics (synergy matrix, damage category, weakness alerts, speed-tier visualizer) compute against the Mega-Evolved form's typing, stats, and ability — not the base form.
* **Persona:** Champions Convert
* **Priority:** Should Have
* **Acceptance Criteria:**
  * Synergy matrix uses Mega form's typing when `slot.megaEvolved === true`.
  * Speed-tier visualizer uses Mega form's base Speed.
  * Damage category checker re-evaluates if the Mega form's ability changes effective move category (e.g., Mega Sceptile gaining Lightning Rod doesn't affect category, but ability-driven category changes do).
  * Weakness alerts recompute against Mega form typing.
  * Toggling Mega Evolve off reverts all analytics to base form within 50ms.
* **Technical Considerations:** Extend the existing analytics math layer (`src/lib/type-effectiveness.ts`, `src/lib/stat-calc.ts`) to accept an optional Mega form override. Do not fork the math; thread the override through.
* **Edge Cases:** Mega forms with new abilities (Dragonize, Mega Sol, Piercing Drill, Spicy Spray) — these need ability-specific handling in the analytics layer if they affect synergy (e.g., Dragonize converts Normal moves to Dragon, which doesn't change *defensive* synergy but could be flagged in damage category).
* **Complexity:** High

### Category: Templates [TM]

**F-TM-03: 10 Curated Meta Templates Per Game**
* **Description:** Hand-authored JSON template lists for each game mode (10 each, 20 total), sourced from public meta references (Pikalytics, VGCPastes, tournament VODs).
* **Persona:** VGC Curious Beginner
* **Priority:** Could Have
* **Acceptance Criteria:**
  * `champions-templates.json` contains 10 entries; `sv-templates.json` contains 10 entries.
  * Each entry conforms to a `TeamSlot[]`-compatible schema.
  * Templates modal in Champions mode shows only Champions templates; same for SV.
  * Loading a template populates all 6 slots with Pokémon, items, abilities, moves, Tera Type (SV) or Mega Stone (Champions).
  * Templates lazy-load via `import()` inside the active route.
* **Technical Considerations:** Champions templates are a best-effort spec given the < 30-day-old meta at v2 build time; expect a v2.1 refresh.
* **Edge Cases:** Template references a Pokémon or item not present in the active dataset — log a console warning and skip the bad slot rather than crashing.
* **Complexity:** Low (after research is done)

**F-TM-04: Template Archetype Metadata**
* **Description:** Each template entry includes `archetype` (e.g., "Trick Room", "Rain", "Sun", "Hyper Offense"), `sourceUrl`, and a one-line `strategyNote`.
* **Persona:** VGC Curious Beginner
* **Priority:** Could Have
* **Acceptance Criteria:**
  * Templates modal renders the archetype tag as a colored badge.
  * Modal renders the strategy note below the team preview.
  * Source URL is rendered as a clickable link.
* **Technical Considerations:** Extend the existing templates modal UI; no new dependencies.
* **Edge Cases:** Missing `sourceUrl` (e.g., template authored from VOD analysis) — render the strategy note only.
* **Complexity:** Low

### Category: Out of Scope [OS]

**F-OS-01..F-OS-04** (carried forward unchanged from v1 `Features.md`)

**F-OS-05: Cross-Game Team Transfer**
* **Priority:** Won't Have
* **Notes:** Loading a Champions team into SV mode (or vice versa) is intentionally not supported. Different gimmicks, different legalities, different item pools — auto-conversion would silently break teams.

**F-OS-06: Battle Simulation / Damage Calculator**
* **Priority:** Won't Have
* **Notes:** Out of scope. v2 remains a *team builder*, not a *battle simulator*. Tools like Pokémon Showdown's calc already serve this niche.

---

## 3. Performance Standards Per Feature

| Feature | Performance Target |
|---------|-------------------|
| F-GM-01 mode switch | < 200ms p95 (warm cache) |
| F-SR-01 search filter recompute | < 50ms p95 for 1,000+ options |
| F-MG-01 Mega Evolve toggle | < 50ms analytics recompute |
| F-LO-01 grid swap | < 16ms (single frame) |
| F-DI-03 v1 migration | < 100ms (one-shot, first load only) |
| Bundle delta v1 → v2 | < 30 KB gzipped initial JS |

## 4. Modified v1 Features (Behavioral Deltas)

| v1 Feature | v2 Change |
|------------|-----------|
| F-TB-01 (6-Slot Roster) | Now per-game, two independent rosters. |
| F-TB-02 (Attribute Selectors) | Each becomes a `<SearchableSelect>` if > 5 options. |
| F-TB-03 (Hardcoded Templates) | Expanded from 3-5 → 10 per game, scoped by mode. |
| F-AV-01 (Synergy Matrix) | Reads Mega form typing in Champions mode when toggled. |
| F-AV-04 (Speed Tier Visualizer) | Uses Mega form Speed when toggled. |
| Item dropdown | No longer curated; shows all held-item-eligible items per game. |
