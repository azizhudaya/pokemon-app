"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PokemonType } from "@/types/pokemon";
import type { EVPresetId, EVSpread, Nature, TeamSlot } from "@/types/team";

export const TEAM_SIZE = 6;

const EMPTY_EVS: EVSpread = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};

export function createEmptySlot(): TeamSlot {
  return {
    speciesId: null,
    speciesName: null,
    nickname: null,
    ability: null,
    item: null,
    teraType: null,
    moves: [null, null, null, null],
    nature: "Hardy",
    evPresetId: "custom",
    evs: EMPTY_EVS,
    level: 50,
  };
}

function createEmptyRoster(): TeamSlot[] {
  return Array.from({ length: TEAM_SIZE }, () => createEmptySlot());
}

interface TeamState {
  roster: TeamSlot[];
  setSpecies: (
    index: number,
    payload: { id: number; name: string } | null,
  ) => void;
  setAbility: (index: number, ability: string | null) => void;
  setItem: (index: number, item: string | null) => void;
  setTeraType: (index: number, teraType: PokemonType | null) => void;
  setMove: (slotIndex: number, moveIndex: number, move: string | null) => void;
  setNature: (index: number, nature: Nature) => void;
  setEVPreset: (
    index: number,
    preset: { id: EVPresetId; nature: Nature; evs: EVSpread },
  ) => void;
  clearSlot: (index: number) => void;
  clearTeam: () => void;
  loadTeam: (roster: TeamSlot[]) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      roster: createEmptyRoster(),

      setSpecies: (index, payload) =>
        set((state) => {
          const next = [...state.roster];
          if (payload === null) {
            next[index] = createEmptySlot();
          } else {
            next[index] = {
              ...createEmptySlot(),
              speciesId: payload.id,
              speciesName: payload.name,
            };
          }
          return { roster: next };
        }),

      setAbility: (index, ability) =>
        set((state) => {
          const next = [...state.roster];
          next[index] = { ...next[index], ability };
          return { roster: next };
        }),

      setItem: (index, item) =>
        set((state) => {
          const next = [...state.roster];
          next[index] = { ...next[index], item };
          return { roster: next };
        }),

      setTeraType: (index, teraType) =>
        set((state) => {
          const next = [...state.roster];
          next[index] = { ...next[index], teraType };
          return { roster: next };
        }),

      setMove: (slotIndex, moveIndex, move) =>
        set((state) => {
          const next = [...state.roster];
          const slot = next[slotIndex];
          const moves = [...slot.moves];
          moves[moveIndex] = move;
          next[slotIndex] = { ...slot, moves };
          return { roster: next };
        }),

      setNature: (index, nature) =>
        set((state) => {
          const next = [...state.roster];
          next[index] = { ...next[index], nature, evPresetId: "custom" };
          return { roster: next };
        }),

      setEVPreset: (index, preset) =>
        set((state) => {
          const next = [...state.roster];
          next[index] = {
            ...next[index],
            evPresetId: preset.id,
            nature: preset.nature,
            evs: preset.evs,
          };
          return { roster: next };
        }),

      clearSlot: (index) =>
        set((state) => {
          const next = [...state.roster];
          next[index] = createEmptySlot();
          return { roster: next };
        }),

      clearTeam: () => set({ roster: createEmptyRoster() }),

      loadTeam: (roster) => {
        const normalized = [...roster];
        while (normalized.length < TEAM_SIZE) {
          normalized.push(createEmptySlot());
        }
        set({ roster: normalized.slice(0, TEAM_SIZE) });
      },
    }),
    {
      name: "vgc-analyzer:team",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export function useRosterSlot(index: number): TeamSlot {
  return useTeamStore((state) => state.roster[index]);
}
