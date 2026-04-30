import type { PokemonType } from "@/types/pokemon";

const TYPE_COLOR_VAR: Record<PokemonType, string> = {
  normal: "var(--color-type-normal)",
  fire: "var(--color-type-fire)",
  water: "var(--color-type-water)",
  electric: "var(--color-type-electric)",
  grass: "var(--color-type-grass)",
  ice: "var(--color-type-ice)",
  fighting: "var(--color-type-fighting)",
  poison: "var(--color-type-poison)",
  ground: "var(--color-type-ground)",
  flying: "var(--color-type-flying)",
  psychic: "var(--color-type-psychic)",
  bug: "var(--color-type-bug)",
  rock: "var(--color-type-rock)",
  ghost: "var(--color-type-ghost)",
  dragon: "var(--color-type-dragon)",
  dark: "var(--color-type-dark)",
  steel: "var(--color-type-steel)",
  fairy: "var(--color-type-fairy)",
};

interface TypeBadgeProps {
  type: PokemonType;
  size?: "xs" | "sm" | "md";
  variant?: "filled" | "outline";
}

export function TypeBadge({ type, size = "sm", variant = "filled" }: TypeBadgeProps) {
  const color = TYPE_COLOR_VAR[type];

  const sizeClasses = {
    xs: "text-[11px] px-1.5 py-0.5 tracking-widest",
    sm: "text-[12px] px-2 py-1 tracking-widest",
    md: "text-[13px] px-2.5 py-1.5 tracking-widest",
  };

  if (variant === "outline") {
    return (
      <span
        aria-label={`${type} type`}
        className={`mono inline-flex items-center uppercase font-medium ${sizeClasses[size]}`}
        style={{
          color,
          border: `1px solid ${color}`,
          background: "transparent",
          borderRadius: 2,
        }}
      >
        {type}
      </span>
    );
  }

  return (
    <span
      aria-label={`${type} type`}
      className={`mono inline-flex items-center uppercase font-medium ${sizeClasses[size]}`}
      style={{
        color: "#0a0b0f",
        background: color,
        border: `1px solid ${color}`,
        borderRadius: 2,
      }}
    >
      {type}
    </span>
  );
}

export function getTypeColorVar(type: PokemonType): string {
  return TYPE_COLOR_VAR[type];
}
