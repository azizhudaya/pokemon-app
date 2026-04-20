"use client";

import { useMemo } from "react";
import { TerminalSelect } from "@/components/ui/select";
import { humanizeSlug } from "@/lib/pokeapi/display";
import type { MoveRef } from "@/types/pokemon";

interface MoveSelectProps {
  slotIndex: number;
  value: string | null;
  legalMoves: MoveRef[];
  selectedOtherMoves: readonly (string | null)[];
  onChange: (move: string | null) => void;
}

/**
 * Strictly filter to the Pokémon's legal movepool (F-TB-02 acceptance criterion).
 * Hide moves that are already picked in the other 3 slots so users can't dupe.
 */
export function MoveSelect({
  slotIndex,
  value,
  legalMoves,
  selectedOtherMoves,
  onChange,
}: MoveSelectProps) {
  const taken = useMemo(
    () => new Set(selectedOtherMoves.filter((m): m is string => Boolean(m))),
    [selectedOtherMoves],
  );

  const options = useMemo(() => {
    const sorted = [...legalMoves].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.map((move) => ({
      value: move.name,
      label: humanizeSlug(move.name).toUpperCase(),
      disabled: taken.has(move.name) && move.name !== value,
    }));
  }, [legalMoves, taken, value]);

  return (
    <TerminalSelect
      label={`MOVE ${slotIndex + 1}`}
      value={value ?? ""}
      onChange={(next) => onChange(next || null)}
      options={[{ value: "", label: "— EMPTY —" }, ...options]}
      disabled={legalMoves.length === 0}
    />
  );
}
