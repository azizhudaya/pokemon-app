import type { MoveBadgeInfo } from "./badges";

interface MoveBadgeProps {
  badge: MoveBadgeInfo;
}

const TONE_BY_KIND: Record<MoveBadgeInfo["kind"], { color: string; bg: string }> = {
  "priority-plus": { color: "var(--term-accent)", bg: "rgba(124, 255, 178, 0.12)" },
  "priority-minus": { color: "var(--term-alert)", bg: "rgba(255, 90, 107, 0.12)" },
  prankster: { color: "var(--term-info)", bg: "rgba(107, 183, 255, 0.12)" },
  "speed-control": { color: "var(--term-warn)", bg: "rgba(255, 181, 71, 0.12)" },
};

export function MoveBadge({ badge }: MoveBadgeProps) {
  const tone = TONE_BY_KIND[badge.kind];
  return (
    <span
      title={badge.description}
      aria-label={badge.description}
      className="mono text-[11px] tracking-wider px-1.5 py-0.5 border"
      style={{
        color: tone.color,
        background: tone.bg,
        borderColor: tone.color,
        borderRadius: 2,
      }}
    >
      {badge.label}
    </span>
  );
}
