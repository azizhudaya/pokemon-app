# RFC-V2-001: Routing Split, Store Factory, v1 Migration

**Status:** Proposed
**Dependencies:** None (foundational)
**Maps to features:** F-GM-01, F-DI-02, F-DI-03
**Estimated size:** Medium (~1.5 days)

## 1. Overview

Split the current single-page builder into two routes (`/champions` default, `/scarlet-violet`), introduce a per-game-mode Zustand store factory with isolated persistence keys, and migrate the v1 `vgc-analyzer:team` localStorage key into the new SV slot on first load.

## 2. Goals

* Two independent rosters, one per game mode, persisted separately.
* Header-level segmented toggle for mode switching.
* `/` redirects to `/champions`.
* v1 users land into SV mode with their team intact.

## 3. Non-Goals

* Filtering species or items by game mode (handled by RFC-V2-002 / 003).
* Mega Evolution UI (RFC-V2-006).
* Game-mode-aware analytics (RFC-V2-006).

## 4. Technical Design

### 4.1 Routing
* `src/app/page.tsx` — replace current builder with a redirect to `/champions` using `redirect('/champions')` from `next/navigation` (works with static export via `<meta http-equiv="refresh">` fallback if needed; verify against the current Next.js version).
* New: `src/app/champions/page.tsx` and `src/app/scarlet-violet/page.tsx`. Both render the same shell:
  ```tsx
  <BuilderShell gameMode="champions" />
  ```
* New: `src/components/layout/builder-shell.tsx` — extracts the layout currently in `page.tsx`, takes `gameMode: GameMode` prop.

### 4.2 Header toggle
* Modify `src/components/layout/app-header.tsx` to add a segmented control with two `<Link>` elements pointing at the two routes. Use `usePathname()` to highlight the active mode.
* Visual: monospace, terminal aesthetic consistent with existing header (`label-strong`, `mono`, `border-hairline`).

### 4.3 Store factory
* New file: `src/store/team-store.ts` (replace existing).
* Export shape:
  ```ts
  export type GameMode = 'champions' | 'sv';

  function createTeamStore(gameMode: GameMode) {
    return create<TeamState>()(
      persist(/* identical store body */, {
        name: `vgc-analyzer:team:${gameMode}`,
        storage: createJSONStorage(() => localStorage),
        version: 1,
      }),
    );
  }

  export const useChampionsTeamStore = createTeamStore('champions');
  export const useSvTeamStore = createTeamStore('sv');

  export function useActiveTeamStore() {
    const pathname = usePathname();
    return pathname.startsWith('/champions') ? useChampionsTeamStore : useSvTeamStore;
  }
  ```
* `TeamSlot` (in `src/types/team.ts`) gains `megaEvolved?: boolean` (Champions-only field, ignored by SV reads).

### 4.4 Migration
* New file: `src/lib/migration/v1-to-v2.ts`:
  ```ts
  export function migrateV1TeamToV2(): void {
    if (typeof window === 'undefined') return;
    const legacy = localStorage.getItem('vgc-analyzer:team');
    const newSv = localStorage.getItem('vgc-analyzer:team:sv');
    if (legacy && !newSv) {
      localStorage.setItem('vgc-analyzer:team:sv', legacy);
      localStorage.removeItem('vgc-analyzer:team');
    }
  }
  ```
* Call once from a top-level client effect in `src/app/layout.tsx` (inside a `useEffect` in a `<MigrationGate>` component) before stores hydrate. Order matters: this runs before any consumer reads from `useSvTeamStore`.
* Idempotent: subsequent loads find no legacy key, no-op.

## 5. API / Component Contracts

| Export | Type | Purpose |
|--------|------|---------|
| `useChampionsTeamStore` | `UseBoundStore<...>` | Champions roster state |
| `useSvTeamStore` | `UseBoundStore<...>` | SV roster state |
| `useActiveTeamStore()` | `() => UseBoundStore<...>` | Current-route store |
| `useRosterSlot(index, mode?)` | `(i: number, m?: GameMode) => TeamSlot` | Read a slot from active or named store |
| `migrateV1TeamToV2()` | `() => void` | One-shot migration, idempotent |

## 6. Acceptance Criteria

* `/` redirects to `/champions`.
* `/champions` and `/scarlet-violet` each render the builder shell.
* Header toggle navigates between routes; active route is visually highlighted.
* Two distinct localStorage keys exist after first interaction in each mode.
* Mutating the Champions roster does not change `vgc-analyzer:team:sv`, and vice versa.
* Browser back/forward across modes preserves both rosters.
* v1 users with `vgc-analyzer:team` localStorage key see their team in `/scarlet-violet` after the first load post-deploy.
* Mode switch (route navigation) p95 < 200ms (warm cache, prefetched).

## 7. Implementation Sequence

1. Add `GameMode` type to `src/types/team.ts`. Add optional `megaEvolved` field to `TeamSlot`.
2. Refactor `src/store/team-store.ts` to factory pattern. Keep all existing actions intact.
3. Create `<BuilderShell gameMode>` by lifting current `src/app/page.tsx` content.
4. Create `src/app/champions/page.tsx` and `src/app/scarlet-violet/page.tsx`.
5. Replace `src/app/page.tsx` with redirect to `/champions`.
6. Add header toggle in `src/components/layout/app-header.tsx`.
7. Write `migrateV1TeamToV2()` and wire it via a `<MigrationGate>` component in `src/app/layout.tsx`.
8. Update every existing `useTeamStore` import call site to use `useActiveTeamStore()`. Audit list (scan for `useTeamStore` imports):
   * `src/features/team-builder/*`
   * `src/features/synergy-matrix/*`
   * `src/features/damage-category/*`
   * `src/features/speed-tier/*`
   * `src/features/weakness-alerts/*`
   * `src/features/showdown-io/*`
   * `src/features/templates/*`
9. Add Jest tests for `migrateV1TeamToV2()` covering: no legacy key, legacy + new exists (no clobber), legacy only (migrates), corrupted JSON (no crash).
10. Manual regression: build both routes, verify SV analytics output is byte-identical to v1 for the same roster.

## 8. Open Questions

* **Q1.** Does Next.js static export support `redirect()` from a server component? If not, fallback options: (a) `<meta http-equiv="refresh">` in `page.tsx`, (b) client-side `router.replace()` in a useEffect, (c) move `/` content into `/champions/page.tsx` and ship `/` as a thin client redirect. Decision: verify in dev, prefer (c) if redirect is finicky.
* **Q2.** Should `useActiveTeamStore` be a hook that returns a hook, or a hook that returns the store's state? The `() => useStore` form is unusual; consider a `useActiveRoster()` selector hook instead to avoid the double-hook footgun.
