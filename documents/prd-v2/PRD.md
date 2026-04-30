# PRD.md
# Product Requirements Document: VGC Analyzer v2 — Multi-Game Builder, Discoverable Selectors, Adaptive Layout

**Document version:** 2.0
**Date:** 2026-04-30
**Supersedes:** `documents/PRD.md` (v1, MVP) and adds new scope on top of shipped v1 features.
**Companion docs:** `documents/Features.md`, `documents/Rules.md` (still authoritative for v1 features).

---

## 1. Overview

VGC Analyzer v1 shipped a deterministic, client-side Gen 9 / Scarlet & Violet-flavored team analyzer with a single combined builder. With **Pokémon Champions** released worldwide on 2026-04-08 (Switch + Switch 2), the competitive scene now spans two distinct rulesets that share data but diverge sharply on legality, gimmicks (Mega Evolution vs. Terastalization), and item pools.

v2 keeps the v1 promise — fast, free, static, beginner-friendly — and extends it along four axes:

1. **Per-game builders.** Two routes, two persisted teams, two dataset filters, two gimmick UIs.
2. **Complete item coverage.** Replace the curated v1 item list with a per-game, fully held-item-eligible catalog.
3. **Discoverable selectors.** Add searchable comboboxes (with substring highlighting and 300ms debounce) wherever an option list exceeds 5 entries.
4. **Adaptive layout & expanded templates.** Roster grid widens to 3 columns when the analytics column is collapsed, and we ship 10 hand-curated meta templates per game.

This is an enhancement release, not a rewrite. v1 math, caching, and analytics components remain authoritative; v2 wraps them with a game-mode selector and tightens the UX shell.

## 2. Goals and Objectives

* **User Goal:** Beginners can pick the game they actually play, then build a *legal* team using the right gimmick and the right item pool — without having to memorize which Pokémon or item belongs to which title.
* **UX Goal:** Every selector with > 5 options becomes searchable. No more endless scrolling through 200+ moves or 1,000+ Pokémon to find one entry.
* **Layout Goal:** When the user collapses the analytics column to focus on building, the roster expands into a denser 3-column grid instead of stretching two slots across the page.
* **Discovery Goal:** Triple the number of starting templates (3-5 → 10 per game) and source them from real meta archetypes.
* **Technical Goal:** Preserve v1's $0-server, static-export constraint. All v2 features remain fully client-side. No backend, no live scraping.

## 3. Scope & Prioritization (MoSCoW)

### Must Have (P0 — required to ship v2)

* **F-GM-01: Game-mode routing & top-level toggle** — Two routes (`/champions` default, `/scarlet-violet`) with a header-level toggle. Each route persists its own roster.
* **F-GM-02: Champions-mode dataset & gimmick** — Filter species to the Champions roster, replace Tera Type controls with **Mega Evolution** controls (Omni Ring + Mega Stone item-driven, BST +100 rule, one per battle), and use the hardcoded Champions item list (Serebii, 2026-04-30 snapshot).
* **F-GM-03: Scarlet/Violet-mode dataset & gimmick** — Filter species to the SV/Indigo Disk Pokédex, keep Terastalization as in v1, and use the SV-appropriate item subset (no Mega Stones, no Omni Ring).
* **F-IT-01: Complete held-item catalog** — Replace the v1 curated list. Each game mode exposes **all held-item-eligible items** legal in that game. No berries-only or held-items-only toggle; show everything that can be held.
* **F-SR-01: Searchable selectors with debounce + highlight** — Every selector with more than 5 options becomes a combobox with a search input. Substring matches are highlighted in the option label. Debounce filtering at 300ms.
* **F-LO-01: Adaptive 3-column roster grid** — When the analytics column is collapsed (`useUiStore.analyticsHidden === true`), the roster grid switches from 2 columns to 3 columns at the desktop breakpoint.

### Should Have (P1)

* **F-LO-02: Sidebar auto-collapse on small viewports** — Below the `lg` breakpoint, analytics is collapsed by default; user can re-expand. Keeps the user-toggle on desktop.
* **F-MG-01: Mega Evolution analytics** — Synergy matrix, damage category, weakness alerts, and speed-tier visualizer all factor in the Mega-Evolved form's typing, stats, and ability when a Mega Stone is held.

### Could Have (P2)

* **F-TM-01: 10 curated meta templates per game (20 total)** — Hand-authored from public meta sources (e.g., Pikalytics, VGCPastes) and baked into the build as JSON. Templates are scoped to a specific game mode and only appear in that mode's builder.
* **F-TM-02: Template metadata** — Each template lists its archetype tag (e.g., "Trick Room", "Rain", "Sun", "Hyper Offense"), source attribution, and a one-line strategy note.

### Won't Have (Out of Scope for v2)

* Live meta scraping (`Rules.md §1` constraint preserved).
* User accounts, cloud sync, multi-device persistence.
* Granular EV/IV sliders (v1 preset-only stance preserved).
* AI/LLM analysis.
* Cross-game team transfer (a Champions team cannot be loaded into SV mode and vice versa, by design).
* Battle simulation / damage calculator.

## 4. User Personas

* **The Champions Convert** *(new in v2)*: Played Mega Evolution-era Pokémon (X/Y, OR/AS) and is returning for Champions. Knows what Charizardite Y means but is rusty on what's actually legal in 2026 VGC. Needs the tool to filter to *only* Champions-legal Pokémon and items so they don't waste time building an illegal team.
* **The Scarlet/Violet Loyalist** *(unchanged from v1)*: Already plays SV ranked. Wants to compare a v1 team to v2 templates and refine it. Should not be exposed to Mega Evolution UI at all.
* **The VGC Curious Beginner** *(carryover from v1)*: Picks whichever game their friends are playing. The default route (`/champions`) lands them in the newer, more visible title.
* **The Search-Allergic Mobile User** *(implicit v1, explicit v2)*: Builds on phone, hates scrolling through huge dropdowns. Expects to type "lev" and immediately see Leftovers, Levitate-effect items, etc.

## 5. Functional Requirements (User Stories)

### Game Mode

* **As a** Champions player, **I want** the app to default to the Champions builder, **so that** I don't have to switch modes on every visit.
* **As a** SV player, **I want** to toggle to SV mode from the header and have my team persist, **so that** my work isn't lost when I switch.
* **As a** dual-game player, **I want** two completely independent rosters (one per mode), **so that** experimenting in one mode doesn't overwrite the other.
* **As a** Champions player, **I want** the species picker to *not* show Pokémon that aren't in Champions, **so that** I can't accidentally build an illegal team.

### Mega Evolution (Champions only)

* **As a** Champions player, **I want** to toggle "Mega Evolve" on a slot when I've equipped a compatible Mega Stone, **so that** the analytics reflect the Mega form.
* **As a** Champions player, **I want** the app to enforce one Mega Evolution per team (mirroring the in-game one-per-battle limit as a UX hint), **so that** I'm not surprised by an illegal lineup. *(Soft warning, not a hard block — a player may legitimately register two Mega-capable mons and choose between them at lead.)*
* **As a** Champions player, **I want** the Mega form's typing, ability, and stats to drive the analytics output when "Mega Evolved" is toggled, **so that** I see post-Mega matchups, not base-form matchups.

### Items

* **As any** user, **I want** to see every held-item-eligible item legal in my current game mode, **so that** I'm not limited to a curated subset.
* **As a** Champions player, **I want** Mega Stones grouped or filterable, **so that** I can find Charizardite X without scrolling past every berry.

### Search

* **As any** user, **I want** to type to filter any selector with more than 5 options, **so that** I find entries by substring instead of scrolling.
* **As any** user, **I want** the matching substring highlighted in each result, **so that** I can visually confirm why an option matched.
* **As any** user, **I want** the search to debounce at 300ms, **so that** the UI doesn't jitter while I'm still typing.

### Layout

* **As any** user, **I want** the roster to use 3 columns when I've collapsed the analytics panel, **so that** I see all 6 Pokémon without scrolling.
* **As a** mobile user, **I want** the analytics panel collapsed by default, **so that** I can build first and analyze later.

### Templates

* **As a** beginner, **I want** at least 10 curated templates for my chosen game, **so that** I have varied starting points beyond v1's 3-5.
* **As a** beginner, **I want** to see each template's archetype tag and strategy note, **so that** I understand *why* the team works before loading it.

## 6. Non-Functional Requirements

* **Performance:**
  * Mode switch (route navigation) must complete in < 200ms on a warm cache.
  * Search filter recompute must complete in < 50ms for any selector (1,000+ items max).
  * Mega Evolution toggle must recompute analytics in < 50ms (per v1 budget).
* **Bundle size:** v2 must not increase the initial JS bundle by more than 30 KB gzipped over v1. Hardcoded item/template JSON ships per-route via dynamic import.
* **Accessibility:**
  * All comboboxes follow the WAI-ARIA `combobox` pattern (`role="combobox"`, `aria-expanded`, `aria-activedescendant`).
  * Search input is fully keyboard navigable: `↑/↓` move highlight, `Enter` selects, `Esc` closes.
  * Substring highlight uses both color contrast *and* font-weight (not color alone) to satisfy WCAG AA.
* **Browser compatibility:** Same as v1 — modern evergreen browsers, mobile and desktop.
* **Infrastructure:** Static export preserved. `output: 'export'` in `next.config.mjs` remains untouched. No API routes, no server actions.
* **Persistence:** Two separate Zustand persist keys — `vgc-analyzer:team:champions` and `vgc-analyzer:team:sv`. v1 `vgc-analyzer:team` migrated to `:sv` on first load (one-time, version-bumped).

## 7. Architecture & Implementation Notes

### 7.1 Routing
* Replace `src/app/page.tsx` single-builder layout with a redirect to `/champions`.
* Add `src/app/champions/page.tsx` and `src/app/scarlet-violet/page.tsx`. Each renders the same `<TeamBuilder />` and `<AnalyticsColumn />` shell, parameterized by a `gameMode` prop.
* Header (`src/components/layout/app-header.tsx`) gains a segmented toggle (`CHAMPIONS | SCARLET/VIOLET`) using Next.js `<Link>` for navigation. Active route is visually emphasized.

### 7.2 Game-mode-aware data layer
* New module: `src/lib/game-mode/` with:
  * `champions-pokedex.ts` — array of Champions-legal species IDs.
  * `sv-pokedex.ts` — array of SV/Indigo Disk-legal species IDs.
  * `champions-items.ts` — hardcoded from Serebii (2026-04-30 snapshot): 30 hold items + 60 Mega Stones + 28 berries.
  * `sv-items.ts` — derived from the v1 item list, minus Mega Stones/Omni Ring, plus all PokeAPI held-item-eligible entries.
  * `mega-evolution-map.ts` — Mega Stone → species ID, plus Mega form's typing, ability, and stat deltas (BST +100 rule).
* Existing `src/lib/pokeapi/` continues to fetch raw data; the new game-mode layer filters/re-shapes it for the active route.

### 7.3 State
* `src/store/team-store.ts` becomes a *factory*: `createTeamStore(gameMode)` returns a Zustand store with a mode-specific persist key. Two singletons exported: `useChampionsTeamStore`, `useSvTeamStore`. A `useActiveTeamStore()` hook reads the current route and returns the right one.
* `TeamSlot` gains an optional `megaEvolved: boolean` field (Champions only). Validated at use site, ignored in SV mode.
* `src/store/ui-store.ts` is unchanged for `analyticsHidden`. Add `analyticsAutoCollapsedByViewport: boolean` to distinguish user-collapsed vs. responsive-collapsed.

### 7.4 Searchable selectors
* New component: `src/components/ui/searchable-select.tsx` — drop-in replacement for the existing `select.tsx` when option count > 5. Internally uses an `<input role="combobox">` plus a filtered `<ul role="listbox">`.
* Search filter logic in `src/lib/search/substring-match.ts`: returns matched ranges for highlighting. Pure function, unit-tested.
* Highlighting component: `src/components/ui/highlighted-text.tsx` — renders `<mark>` spans for matched ranges.
* Debounce: 300ms via `useDebouncedValue` hook (new, in `src/lib/hooks/`).

### 7.5 Adaptive layout
* In `src/features/team-builder/team-builder.tsx`, change the roster grid from `grid-cols-1 xl:grid-cols-2` to a class derived from `useUiStore.analyticsHidden`:
  * Analytics visible: `grid-cols-1 xl:grid-cols-2` (current).
  * Analytics hidden: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`.
* Below `lg` breakpoint, `useUiStore` initializes `analyticsHidden = true` on first mount (P1).

### 7.6 Templates
* `src/features/templates/` gains two new JSON files: `champions-templates.json` and `sv-templates.json`, each with 10 entries.
* Template entry schema: `{ id, name, archetype, gameMode, sourceUrl, strategyNote, slots: TeamSlot[] }`.
* `TemplatesModal` filters by current game mode.

## 8. User Journeys

### Journey A: Returning Champions Player (Default Path)
1. User lands on `/` and is redirected to `/champions`.
2. Header shows `CHAMPIONS | SCARLET/VIOLET` toggle with Champions active.
3. User clicks slot 1, types "char" into the species search. Charizard, Charmander, Charmeleon, Charcadet appear with "char" highlighted.
4. User picks Charizard. Item dropdown opens; user types "char" and Charizardite X / Charizardite Y appear at the top.
5. User selects Charizardite Y. A new "Mega Evolve" toggle appears on the slot.
6. User toggles Mega Evolve. Synergy matrix instantly recalculates against Mega Charizard Y's Fire/Flying typing and Drought ability.
7. User collapses the analytics panel (existing v1 toggle). Roster grid expands to 3 columns; all 6 slots fit on one screen.

### Journey B: SV Player Switching from v1
1. User opens the app (already had a v1 team saved). Auto-redirect lands them on `/champions`.
2. User clicks `SCARLET/VIOLET` in the header. Their v1 team has been migrated to the SV slot and is intact.
3. User opens Templates. They see 10 SV templates, no Champions templates.
4. User builds without ever seeing Mega Evolution UI.

### Journey C: Mobile User
1. User opens `/champions` on phone. Analytics panel is auto-collapsed.
2. Roster shows in single column (mobile breakpoint), takes full width.
3. User taps slot, picks Pokémon via search (300ms debounce avoids jitter on a slow connection).
4. After building 6 slots, user taps `EXPAND ANALYTICS`. Panel slides in.

## 9. Success Metrics

* **Adoption split:** Within 30 days of v2 launch, ≥ 40% of sessions are on `/champions` and ≥ 30% on `/scarlet-violet` (the rest = no preference / first-visit redirect).
* **Search usage:** ≥ 60% of slot-fills happen via the search input rather than scrolling.
* **Template engagement:** ≥ 20% of new sessions load a template (up from v1 baseline of an estimated 8-10%).
* **Layout preference:** Track `analyticsHidden` state — if ≥ 25% of desktop sessions toggle to hidden, the 3-col grid is justified (validates F-LO-01).
* **Performance:** p95 search-filter latency < 50ms; p95 mode-switch < 200ms.
* **Zero regression:** v1 SV math (synergy matrix, damage category, weakness alerts, speed tiers) produces byte-identical output for migrated v1 teams.

## 10. Timeline (Estimate: 3 Weeks)

* **Week 1 — Foundations**
  * Routing split (`/champions`, `/scarlet-violet`), header toggle, store factory, persist-key migration.
  * Hardcoded Champions item list + species filter; SV item list + species filter.
* **Week 2 — Core UX**
  * `SearchableSelect` component + substring-match utility + debounce hook.
  * Apply searchable selector to: species, items, moves, abilities, Tera Type, EV presets, templates.
  * Adaptive 3-column roster grid; mobile auto-collapse.
* **Week 3 — Champions gimmick & templates**
  * Mega Evolution map, slot toggle, analytics integration.
  * 10 Champions templates + 10 SV templates (research + author).
  * Polish, accessibility audit, regression test against v1 teams, ship.

## 11. Open Questions / Assumptions

* **A1.** *Assumption:* The Champions roster is the union of all Pokémon explicitly listed on Serebii's Champions Pokédex as of 2026-04-30. We will hardcode this snapshot; future Champions DLC will require a manual update PR (acceptable maintenance burden per the no-server constraint).
* **A2.** *Assumption:* Champions' Mega Evolution mechanic — Omni Ring item + compatible Mega Stone, BST +100 rule, one per battle — is treated as soft UX hints, not legality blocks. The user may register two Mega-capable Pokémon; the app shows a one-line note ("Only one Mega Evolution per battle") on the second one.
* **A3.** *Assumption:* "Held-item-eligible" for SV mode means PokeAPI items with the `held-by-pokemon` attribute non-empty in the latest game version, plus berries. We will not enumerate PokeAPI items that are key/plot/quest-only.
* **A4.** *Open Question:* Should the search input also match alternate names (e.g., typing "lefties" matches "Leftovers")? **Default:** No — exact-substring on display name only. Aliases can be a v2.1 polish item.
* **A5.** *Open Question:* Should the templates be loaded synchronously (bundled) or lazy-loaded per game route? **Default:** Lazy-loaded via `import()` inside the active route to keep the initial bundle small.
* **A6.** *Open Question:* When a user is on `/champions` and toggles to `/scarlet-violet`, should we warn if the Champions team has unsaved Mega Evolution settings that won't apply in SV? **Default:** No warning needed — the rosters are independent and persisted separately, so nothing is "lost."
* **A7.** *Open Question:* Sources for the 10 Champions templates? Champions only released 2026-04-08; the meta is < 30 days old at v2 spec time. We may have to ship initial templates based on early-tournament VOD analysis and bump them in v2.1 once the meta settles.
* **A8.** *Open Question:* Does Pokémon Showdown's import/export format encode Mega Evolution intent? If so, the Champions builder should preserve that round-trip; if not, we ship Champions teams in a Showdown-compatible subset that strips the Mega flag (with a note in the export).

---

**Next step:** Once this PRD is approved, run `/prd-features` and `/prd-rfcs` against it (in `documents/prd-v2/`) to break it into RFCs. Recommended slicing:

1. RFC-V2-001: Routing split + game-mode store factory + v1 migration.
2. RFC-V2-002: Champions dataset (species filter, item list).
3. RFC-V2-003: SV dataset (species filter, expanded item list).
4. RFC-V2-004: SearchableSelect + substring match + debounce.
5. RFC-V2-005: Adaptive 3-column layout + mobile auto-collapse.
6. RFC-V2-006: Mega Evolution gimmick + analytics integration.
7. RFC-V2-007: Per-game templates (×10 each).
