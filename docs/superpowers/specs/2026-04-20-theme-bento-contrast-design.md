# Theme Redesign: Bento Styling + Contrast Fixes

## Overview

Address three user-reported issues with the current "Esports Terminal" theme:
1. Secondary/muted text colors have insufficient contrast against the dark background
2. Layout panels feel sharp and dated - user wants softer "bento-style" aesthetics
3. Speed tier chart tooltip has black text that is unreadable

## Scope

- Update color tokens in `globals.css`
- Update panel styling for bento aesthetic
- Fix Recharts tooltip text color in speed-tier component
- Dark theme only (no light theme)

## Design Decisions

### Color Token Updates

| Token | Current | New | Contrast vs #0a0b0f |
|-------|---------|-----|---------------------|
| `--term-fg-muted` | `#58627a` | `#7a8599` | 2.1:1 → 4.5:1 (WCAG AA) |
| `--term-fg-dim` | `#9aa4b3` | `#b3bcc9` | 5.4:1 → 7.5:1 (WCAG AAA) |

Rationale: Maintains the cool-gray hue family while meeting accessibility standards. The muted color is used for labels and tertiary text; the dim color for secondary content.

### Bento Panel Styling

Current:
- `border-radius: 2px` (sharp terminal aesthetic)
- Sharp top-edge glow via `::before` pseudo-element

New:
- `border-radius: 8px` (soft but retains some edge)
- Adjust `::before` glow to use `border-radius: 8px 8px 0 0` for proper corner alignment
- No shadow (keep flat aesthetic)
- Grid gap remains at `gap-6` (24px) - unchanged

### Speed Tier Tooltip Fix

Location: `src/features/speed-tier/speed-tier-chart.tsx`

Problem: Recharts `Tooltip` component applies `contentStyle.color` only to the container. The formatter's returned label text uses Recharts' default black color.

Solution: Add explicit `labelStyle` and `itemStyle` props:

```tsx
<Tooltip
  contentStyle={{
    background: "var(--term-panel-elev)",
    border: "1px solid var(--term-hairline-strong)",
    borderRadius: 8,
    fontSize: 11,
    fontFamily: "var(--font-jetbrains-mono)",
    color: "var(--term-fg)",
  }}
  labelStyle={{ color: "var(--term-fg)" }}
  itemStyle={{ color: "var(--term-fg)" }}
  // ... rest unchanged
/>
```

## Files to Modify

1. **`src/app/globals.css`**
   - Update `--term-fg-muted` value
   - Update `--term-fg-dim` value
   - Update `.panel` border-radius from 2px to 8px
   - Update `.panel::before` to have matching top border-radius

2. **`src/features/speed-tier/speed-tier-chart.tsx`**
   - Add `labelStyle` and `itemStyle` props to Tooltip component
   - Update `contentStyle.borderRadius` from 2 to 8 for consistency

## Out of Scope

- Light theme (user chose to skip this)
- Changing grid layout structure
- Modifying panel gap spacing
- Adding shadows or depth effects

## Testing Checklist

- [ ] Muted text (`.label` class) is readable on all panels
- [ ] Secondary text (`text-fg-dim`) is clearly visible
- [ ] Panels have consistent 8px rounded corners
- [ ] Panel top glow aligns with rounded corners
- [ ] Speed tier tooltip shows light text on dark background
- [ ] No visual regressions in existing components
