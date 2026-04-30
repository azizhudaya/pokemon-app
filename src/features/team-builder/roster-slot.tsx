"use client";

import { useTeamStore, useRosterSlot } from "@/store/team-store";
import { useSpecies } from "@/features/pokemon-data/hooks";
import { PokemonPicker } from "./pokemon-picker";
import { AbilitySelect } from "./ability-select";
import { ItemSelect } from "./item-select";
import { TeraTypeSelect } from "./tera-type-select";
import { MoveSelect } from "./move-select";
import { TypeBadge } from "@/components/ui/type-badge";
import { MoveSummary } from "./move-summary";
import { PresetSelector } from "@/features/ev-presets/preset-selector";

interface RosterSlotProps {
  index: number;
}

export function RosterSlot({ index }: RosterSlotProps) {
  const slot = useRosterSlot(index);
  const setSpecies = useTeamStore((state) => state.setSpecies);
  const setAbility = useTeamStore((state) => state.setAbility);
  const setItem = useTeamStore((state) => state.setItem);
  const setTeraType = useTeamStore((state) => state.setTeraType);
  const setMove = useTeamStore((state) => state.setMove);
  const clearSlot = useTeamStore((state) => state.clearSlot);

  const speciesQuery = useSpecies(slot.speciesId);
  const species = speciesQuery.data;

  return (
    <article className="panel" aria-label={`Team slot ${index + 1}`}>
      <header className="panel-header">
        <span className="label-strong">
          SLOT {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-3">
          {species ? (
            <span className="label mono text-fg-muted">
              #{String(species.id).padStart(4, "0")}
            </span>
          ) : null}
          {slot.speciesId !== null ? (
            <button
              type="button"
              onClick={() => clearSlot(index)}
              className="label text-fg-muted hover:text-alert transition-colors"
              aria-label={`Clear slot ${index + 1}`}
            >
              ×
            </button>
          ) : null}
        </div>
      </header>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 shrink-0 bg-void border border-hairline flex items-center justify-center overflow-hidden">
            {species?.spriteUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={species.spriteUrl}
                alt={`${species.displayName} sprite`}
                width={80}
                height={80}
                loading="lazy"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="label text-fg-muted">EMPTY</span>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <PokemonPicker
              value={
                slot.speciesId !== null && slot.speciesName !== null
                  ? { id: slot.speciesId, name: slot.speciesName }
                  : null
              }
              onSelect={(payload) => setSpecies(index, payload)}
            />
            {species ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="mono text-sm tracking-wider text-fg">
                  {species.displayName.toUpperCase()}
                </span>
                <div className="flex items-center gap-1">
                  {species.types.map((type) => (
                    <TypeBadge key={type} type={type} size="xs" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="label text-fg-muted">NO SELECTION</div>
            )}
          </div>
        </div>

        {species ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AbilitySelect
                value={slot.ability}
                abilities={species.abilities}
                onChange={(next) => setAbility(index, next)}
              />
              <ItemSelect value={slot.item} onChange={(next) => setItem(index, next)} />
              <TeraTypeSelect
                value={slot.teraType}
                onChange={(next) => setTeraType(index, next)}
              />
              <div className="flex flex-col gap-1">
                <span className="label-strong">BASE STATS</span>
                <div className="mono text-[12px] text-fg-dim flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>HP {species.baseStats.hp}</span>
                  <span>ATK {species.baseStats.attack}</span>
                  <span>DEF {species.baseStats.defense}</span>
                  <span>SPA {species.baseStats.specialAttack}</span>
                  <span>SPD {species.baseStats.specialDefense}</span>
                  <span>SPE {species.baseStats.speed}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slot.moves.map((move, moveIndex) => (
                <MoveSelect
                  key={moveIndex}
                  slotIndex={moveIndex}
                  value={move}
                  legalMoves={species.moves}
                  selectedOtherMoves={slot.moves.filter((_, i) => i !== moveIndex)}
                  onChange={(next) => setMove(index, moveIndex, next)}
                />
              ))}
            </div>

            <MoveSummary moves={slot.moves} ability={slot.ability} />

            <PresetSelector slotIndex={index} />
          </>
        ) : null}
        {speciesQuery.isLoading && slot.speciesId !== null ? (
          <div className="label text-fg-muted">LOADING SPECIES DATA...</div>
        ) : null}
        {speciesQuery.isError ? (
          <div className="label text-alert">ERROR LOADING SPECIES</div>
        ) : null}
      </div>
    </article>
  );
}
