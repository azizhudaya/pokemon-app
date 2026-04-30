# RFC-V2-004: SearchableSelect Component + Substring Match + Debounce

**Status:** Proposed
**Dependencies:** None (UI primitive, can ship in parallel)
**Maps to features:** F-SR-01
**Estimated size:** Large (~2 days)

## 1. Overview

Build a single reusable `<SearchableSelect>` component that replaces the existing `<Select>` (`src/components/ui/select.tsx`) wherever an option list exceeds 5 entries. The component supports: substring filter, 300ms debounce, matched-substring highlighting, full keyboard navigation, and WAI-ARIA combobox semantics.

This RFC also delivers the supporting primitives: `useDebouncedValue` hook, `substring-match` utility, and `<HighlightedText>` component.

## 2. Goals

* One `<SearchableSelect>` API, drop-in compatible with the current `<Select>` callsites that have > 5 options.
* Selectors with ≤ 5 options keep using the simple `<Select>` (no behavior change).
* Filter recompute < 50ms for 1,000+ options.
* Full keyboard support (`↑/↓/Enter/Esc`, focus trap).
* WCAG AA contrast for highlighted matches; highlight uses both color and font weight.

## 3. Non-Goals

* Multi-select (single selection only — current selectors are all single-select).
* Async loading of options (all option lists are local; PokeAPI data is pre-cached).
* Virtual scrolling (Phase 2 — only needed if any list exceeds 1,500 options; species list with national dex full = ~1,025 max, manageable without virtualization in modern browsers).

## 4. Technical Design

### 4.1 Component API

```ts
// src/components/ui/searchable-select.tsx

export interface SearchableSelectOption {
  value: string;
  label: string;
  group?: string;   // optional category header (Champions items)
  meta?: ReactNode; // optional secondary text (e.g., type icon for moves)
}

export interface SearchableSelectProps {
  options: ReadonlyArray<SearchableSelectOption>;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  emptyMessage?: string;        // default: "No results"
  ariaLabel: string;
  disabled?: boolean;
  /** Override the > 5 threshold (rarely needed) */
  alwaysSearchable?: boolean;
}
```

### 4.2 Substring match utility

```ts
// src/lib/search/substring-match.ts

export interface MatchRange {
  start: number;
  end: number;
}

export interface MatchResult {
  matches: boolean;
  ranges: MatchRange[];
}

export function substringMatch(label: string, query: string): MatchResult {
  if (!query) return { matches: true, ranges: [] };
  const lowerLabel = label.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerLabel.indexOf(lowerQuery);
  if (idx === -1) return { matches: false, ranges: [] };
  return { matches: true, ranges: [{ start: idx, end: idx + lowerQuery.length }] };
}
```

* Single-occurrence match (first hit only). Multi-hit highlighting is YAGNI for v2.
* Treats the query as a literal substring; no regex, no special-character escapes needed since we don't compile a RegExp.
* O(n) per option label; well under the 50ms budget for 1,000 entries.

### 4.3 Debounce hook

```ts
// src/lib/hooks/use-debounced-value.ts

export function useDebouncedValue<T>(value: T, delayMs: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
```

* Default 300ms (per PRD).
* Cancels on unmount and on rapid input changes (cleanup function).

### 4.4 Highlighted-text component

```ts
// src/components/ui/highlighted-text.tsx

interface Props {
  text: string;
  ranges: MatchRange[];
}

export function HighlightedText({ text, ranges }: Props) {
  // Walk the string, emit alternating <span> and <mark>
  // <mark> styled with bg-accent/20, font-bold to satisfy WCAG AA
}
```

### 4.5 Component internals

* Internal state: `inputValue` (controlled input), `isOpen`, `highlightedIndex`.
* Filter pipeline: `inputValue` → `useDebouncedValue(inputValue, 300)` → memoized filter against options.
* `<input role="combobox">`, `<ul role="listbox">`, `<li role="option">` with `aria-selected`.
* Focus management: opening sets `highlightedIndex` to the currently selected option (or 0). `Esc` closes and restores focus to the input. Click-outside closes via a `useClickOutside` hook (write inline if not already present).
* Keyboard:
  * `↓` / `↑`: move highlight, wrap.
  * `Enter`: select highlighted option, close.
  * `Esc`: close, clear input, focus back on trigger.
  * `Tab`: close (don't trap, follow native combobox semantics).

### 4.6 Group headers

* When options include `group` strings, render a non-selectable `<li role="presentation">` separator above each group's first item.
* Filter behavior: if a group has zero matches, hide the header. If it has matches, keep the header and the matched options.

### 4.7 Threshold logic

* Default: render the simple `<Select>` if `options.length <= 5`, otherwise `<SearchableSelect>`.
* Implement as a thin wrapper component `<AutoSelect>` that picks one or the other, OR have the call sites decide explicitly. **Decision:** explicit call sites — clearer and avoids reflow if option count fluctuates near the threshold.

## 5. Acceptance Criteria

* `<SearchableSelect>` exposes the API in §4.1.
* Substring match is case-insensitive and returns the first occurrence's range.
* Highlighting uses `<mark>` with both color (Tailwind `bg-accent/20`) and font weight (`font-bold`).
* Debounce is 300ms by default, configurable.
* Keyboard nav: `↑/↓/Enter/Esc/Tab` all work as specified.
* ARIA: `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-controls`, plus `role="listbox"` and `role="option"`.
* Filter recompute < 50ms p95 for a 1,025-entry species list (test on a mid-tier laptop).
* All current selector callsites with > 5 options migrated:
  * Species picker (~1,025 options)
  * Item picker (~118 Champions / ~250 SV)
  * Move picker (varies, usually 50-100)
  * Ability picker (varies, often ≤ 5 — keep simple Select unless > 5)
  * Tera Type picker (18 — qualifies for SearchableSelect in SV mode)
  * EV preset picker (5-7 — case-by-case)
  * Templates picker (10 entries when RFC-V2-007 lands — qualifies)
* Selectors with ≤ 5 options retain `<Select>`.
* Empty results show `<SearchableSelectProps.emptyMessage>` (default "No results") with a clear-search button.

## 6. Implementation Sequence

1. Implement `substringMatch()` and unit-test it (empty query, no match, exact match, case mismatch, query at start/middle/end of label).
2. Implement `useDebouncedValue` and unit-test it with fake timers.
3. Implement `<HighlightedText>` and snapshot-test it.
4. Implement `<SearchableSelect>` with full keyboard nav. Write RTL tests for: open/close, type-to-filter, ↑/↓ nav, Enter selection, Esc close, click-outside close, group headers, empty state.
5. Migrate selectors one at a time, in order of impact:
   * Species picker (biggest UX win)
   * Item picker (depends on RFC-V2-002 and 003 for the data)
   * Move picker
   * Tera Type picker (SV)
   * Templates picker (after RFC-V2-007)
6. Run a 1,025-entry perf test; confirm < 50ms.
7. Accessibility audit: keyboard-only nav of every selector, screen reader pass with VoiceOver / NVDA.

## 7. Open Questions

* **Q1.** Should the search support fuzzy matching (e.g., "leftvs" → "Leftovers") in v2.1? Not in v2 scope, but flag the API to allow swapping the match function later.
* **Q2.** Should we highlight *all* substring occurrences instead of just the first? Multi-hit highlighting adds complexity to `<HighlightedText>` and provides marginal value when the substring is short. Default: first-occurrence only.
* **Q3.** Mobile UX: should the dropdown render as a full-screen sheet instead of an inline popover on small viewports? Out of scope for v2 first cut; revisit if mobile feedback flags it.
