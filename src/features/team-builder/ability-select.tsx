"use client";

import { TerminalSelect } from "@/components/ui/select";
import type { PokemonAbility } from "@/types/pokemon";

interface AbilitySelectProps {
  value: string | null;
  abilities: PokemonAbility[];
  onChange: (name: string | null) => void;
}

export function AbilitySelect({ value, abilities, onChange }: AbilitySelectProps) {
  // F-TB-02 edge case: when only one ability exists, we still render the select
  // (for accessibility / label consistency) but it is effectively fixed.
  return (
    <TerminalSelect
      label="ABILITY"
      value={value ?? ""}
      onChange={(next) => onChange(next || null)}
      options={[
        { value: "", label: "— SELECT —" },
        ...abilities.map((ability) => ({
          value: ability.name,
          label: `${ability.displayName}${ability.isHidden ? " (H)" : ""}`.toUpperCase(),
        })),
      ]}
      disabled={abilities.length === 0}
    />
  );
}
