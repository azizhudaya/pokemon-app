# RFC-V2-005: Adaptive 3-Column Layout & Mobile Auto-Collapse

**Status:** Proposed
**Dependencies:** None (pure UI/state, ships in parallel)
**Maps to features:** F-LO-01, F-LO-02
**Estimated size:** Small (~0.5 day)

## 1. Overview

When the user collapses the analytics column (existing v1 toggle), expand the team-builder roster grid to 3 columns at the desktop breakpoint instead of stretching 2 slots across the viewport. On viewports below the `lg` breakpoint, auto-collapse the analytics column on first mount so mobile users see the builder first.

## 2. Goals

* Roster grid switches from 2-col → 3-col when analytics is collapsed.
* All 6 slots fit on one screen at 1440px+ when in 3-col mode.
* Mobile (< `lg` breakpoint): analytics auto-collapsed on first load; user can expand.
* User-driven collapse on desktop is preserved across viewport resizes.

## 3. Non-Goals

* Drag-and-drop slot reordering.
* Animated grid transitions (instant snap is acceptable).
* Custom column count (always 3 — not user-configurable).

## 4. Technical Design

### 4.1 Roster grid class derivation

In `src/features/team-builder/team-builder.tsx`:

```tsx
const analyticsHidden = useUiStore((s) => s.analyticsHidden);

const rosterGridClass = analyticsHidden
  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
  : 'grid grid-cols-1 xl:grid-cols-2 gap-4';
```

Replace the current static `grid grid-cols-1 xl:grid-cols-2 gap-4` with the derived class.

### 4.2 Mobile auto-collapse

Extend `src/store/ui-store.ts`:

```ts
interface UiState {
  analyticsHidden: boolean;
  analyticsAutoCollapsedByViewport: boolean;
  toggleAnalyticsHidden: () => void;
  setAnalyticsHidden: (hidden: boolean) => void;
  /** Called by responsive listener; only applies if user hasn't manually toggled */
  applyResponsiveCollapse: (shouldCollapse: boolean) => void;
}
```

State semantics:
* `analyticsHidden`: the source of truth for the layout.
* `analyticsAutoCollapsedByViewport`: `true` if the most recent change came from the responsive listener; `false` if the user toggled.
* `toggleAnalyticsHidden`/`setAnalyticsHidden`: also clear `analyticsAutoCollapsedByViewport` to `false`.
* `applyResponsiveCollapse(should)`: only mutates if `analyticsAutoCollapsedByViewport === true` OR (`analyticsHidden === false && should === true`) — i.e., responsive logic can collapse but never re-opens against a user's explicit collapse.

### 4.3 Responsive listener

New component: `src/components/layout/responsive-collapse-watcher.tsx` (client component, mounted once in the builder shell):

```tsx
'use client';
useEffect(() => {
  const mql = window.matchMedia('(min-width: 1024px)'); // tailwind lg
  const update = () => useUiStore.getState().applyResponsiveCollapse(!mql.matches);
  update();           // run once on mount
  mql.addEventListener('change', debounce(update, 150));
  return () => mql.removeEventListener('change', update);
}, []);
return null;
```

* Debounce 150ms to prevent flicker from devtools resize.
* SSR-safe: no `window` access during render. Initial state is `analyticsHidden: false` server-side; the client-side effect collapses on first mount if mobile.

### 4.4 Persistence interaction

Zustand persist serializes `analyticsHidden`. To avoid the persisted state overriding the responsive collapse on first mobile load:

* Increment `useUiStore` persist version to `2`.
* Migration: if the persisted state is `analyticsHidden: false` but viewport is mobile on hydrate, the responsive watcher's first-run will collapse it. No migration code needed — the watcher's effect handles it.

## 5. Acceptance Criteria

* When `analyticsHidden === false`: roster shows 1 col on mobile, 2 cols on `xl` (≥ 1280px).
* When `analyticsHidden === true`: roster shows 1 col on mobile, 2 cols on `md` (≥ 768px), 3 cols on `xl` (≥ 1280px).
* All 6 slots fit on a 1440px-wide screen with analytics collapsed.
* On a viewport < `lg` (< 1024px) with no prior preference: analytics is collapsed on first mount.
* Resizing devtools width back and forth does not cause flicker (debounce 150ms verified).
* User-collapsed state on desktop survives a viewport resize down to mobile and back up (manual toggle wins).
* No hydration mismatch warnings in dev console.

## 6. Implementation Sequence

1. Extend `ui-store.ts` with `analyticsAutoCollapsedByViewport` and `applyResponsiveCollapse` action.
2. Create `<ResponsiveCollapseWatcher />` and mount it once at the top of `<BuilderShell>`.
3. Update `team-builder.tsx` roster grid class derivation.
4. Verify on mobile emulator and desktop: collapse, expand, resize.
5. Add a unit test for `applyResponsiveCollapse` covering: user-collapsed-then-resize, auto-collapsed-then-resize-up, fresh-mount-mobile.
6. Visual regression: capture screenshots of analytics-visible (2-col) and analytics-hidden (3-col) states.

## 7. Open Questions

* **Q1.** Should the toggle button label change ("EXPAND ANALYTICS" vs. "COLLAPSE ANALYTICS") based on state? Likely yes — the existing `ANALYTICS` toggle label should reflect intent. Mark as polish, not blocking.
* **Q2.** When resizing from mobile up to desktop, should we *auto-expand* analytics (since the user is now on a screen big enough to show both)? Default: no — auto-expand surprises desktop-loading-then-resizing users. Only auto-collapse on shrink, never auto-expand on grow.
* **Q3.** Does the 3-col grid look cramped at the `xl` breakpoint exactly (1280px)? Validate at 1280, 1366, 1440, 1920. If 1280 looks tight, bump the 3-col activation to a custom breakpoint (e.g., `min-width: 1440px`) instead of `xl`.
