# RFCS.md
# Master RFC Roadmap: VGC Analyzer v2

**Source PRD:** `documents/prd-v2/PRD.md` (v2.0, 2026-04-30)
**Source Features:** `documents/prd-v2/FEATURES.md`
**Status:** Proposed

## 1. RFC Index

| RFC | Title | Dependencies | Size | Priority | Maps To Features |
|-----|-------|--------------|------|----------|------------------|
| RFC-V2-001 | Routing Split, Store Factory, v1 Migration | — | M (1.5d) | P0 | F-GM-01, F-DI-02, F-DI-03 |
| RFC-V2-002 | Champions Dataset (Pokédex + Items) | 001 | M (1d) | P0 | F-GM-02 (data layer), F-IT-02 (Champions side) |
| RFC-V2-003 | Scarlet/Violet Dataset (Pokédex + Items) | 001 | S (0.5d) | P0 | F-GM-03, F-IT-02 (SV side) |
| RFC-V2-004 | SearchableSelect Component + Substring Match + Debounce | — | L (2d) | P0 | F-SR-01 |
| RFC-V2-005 | Adaptive 3-Column Layout & Mobile Auto-Collapse | — | S (0.5d) | P0 + P1 | F-LO-01, F-LO-02 |
| RFC-V2-006 | Mega Evolution Gimmick & Analytics Integration | 002 | L (2.5d) | P0 + P1 | F-GM-02 (gimmick UI), F-MG-01 |
| RFC-V2-007 | Per-Game Templates (×10 each) | 002, 003 | M (1d build + research) | P2 | F-TM-03, F-TM-04 |

**Total estimate:** ~9 dev-days + meta research time for templates.

## 2. Dependency Graph

```
                    ┌─── RFC-V2-001 ───┐
                    │  (routing+store) │
                    └──┬───────────┬───┘
                       │           │
              ┌────────▼──┐    ┌───▼─────────┐
              │ RFC-V2-002│    │  RFC-V2-003 │
              │ (Champions│    │   (SV       │
              │  dataset) │    │   dataset)  │
              └──┬────────┘    └──────┬──────┘
                 │                    │
       ┌─────────▼─────┐              │
       │  RFC-V2-006   │              │
       │   (Mega Evo)  │              │
       └───────────────┘              │
                                      │
       ┌──────────────────────────────┴──┐
       │           RFC-V2-007             │
       │       (templates ×10 each)       │
       └──────────────────────────────────┘

Independent (can ship in parallel):
- RFC-V2-004  (SearchableSelect — pure UI primitive, no data dep)
- RFC-V2-005  (layout — pure CSS/state, no data dep)
```

## 3. Recommended Build Order

### Sprint 1 (Week 1): Foundations
1. **RFC-V2-001** — routing, store factory, migration (must be first, everything depends on it)
2. **RFC-V2-004** — SearchableSelect (parallel; needed by every other RFC's UI)
3. **RFC-V2-005** — adaptive layout (parallel; quick win, low risk)

### Sprint 2 (Week 2): Data + Mode Wiring
4. **RFC-V2-002** — Champions dataset (depends on 001)
5. **RFC-V2-003** — SV dataset (depends on 001; small, can pair with 002)
6. Apply `<SearchableSelect>` to all selectors (integration, depends on 002, 003, 004)

### Sprint 3 (Week 3): Champions Gimmick + Templates
7. **RFC-V2-006** — Mega Evolution (depends on 002)
8. **RFC-V2-007** — Templates (depends on 002, 003) — research can run in parallel with earlier sprints

## 4. Cross-Cutting Concerns

These apply to all RFCs and are spelled out once here, not repeated in each RFC:

* **Static export discipline.** No new API routes, server actions, or `getServerSideProps`. All RFCs honor `Rules.md §1`.
* **Bundle budget.** Every RFC must report its delta on the initial JS bundle and stay collectively under 30 KB gzipped.
* **TypeScript strict.** No `any`. Every new module exports lean types from `src/types/`.
* **Testing.** Every RFC introducing logic into `src/lib/` must add Jest unit tests. UI components require RTL tests for keyboard interaction.
* **Accessibility.** Any RFC introducing interactive UI must include WAI-ARIA review and keyboard-nav verification.
* **Performance.** Every RFC names its perf target in its acceptance criteria; PRD §6 is the authoritative budget.

## 5. Out-of-Scope for v2 (Explicit RFC-Free Zones)

These were considered as RFCs but explicitly deferred:

* **RFC-V2-X (deferred): Cross-game team conversion.** Too risky for silent failures; better as a manual export/import flow if ever needed.
* **RFC-V2-X (deferred): Dynamic Pokémon Champions roster updates.** v2 hardcodes the 2026-04-30 snapshot; future Champions DLC requires a manual data-only PR.
* **RFC-V2-X (deferred): Showdown round-trip with Mega flag.** Open question A8 in PRD; resolve before any RFC is written.
