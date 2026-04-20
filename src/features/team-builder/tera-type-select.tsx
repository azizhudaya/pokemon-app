"use client";

import { POKEMON_TYPES, type PokemonType } from "@/types/pokemon";
import { TerminalSelect } from "@/components/ui/select";

interface TeraTypeSelectProps {
  value: PokemonType | null;
  onChange: (type: PokemonType | null) => void;
}

export function TeraTypeSelect({ value, onChange }: TeraTypeSelectProps) {
  return (
    <TerminalSelect
      label="TERA TYPE"
      value={value ?? ""}
      onChange={(next) => onChange((next || null) as PokemonType | null)}
      options={[
        { value: "", label: "— NONE —" },
        ...POKEMON_TYPES.map((type) => ({
          value: type,
          label: type.toUpperCase(),
        })),
      ]}
    />
  );
}
