"use client";

import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchMove,
  fetchPokemonIndex,
  fetchPokemonSpecies,
} from "@/lib/pokeapi/client";
import type {
  MoveInfo,
  PokemonIndexEntry,
  PokemonSpecies,
} from "@/types/pokemon";

export const INDEX_QUERY_KEY = ["pokemon-index"] as const;

export function usePokemonIndex() {
  return useQuery<PokemonIndexEntry[]>({
    queryKey: INDEX_QUERY_KEY,
    queryFn: fetchPokemonIndex,
  });
}

export function speciesQueryKey(id: number | null): readonly unknown[] {
  return ["pokemon-species", id] as const;
}

export function useSpecies(id: number | null) {
  return useQuery<PokemonSpecies>({
    queryKey: speciesQueryKey(id),
    queryFn: () => fetchPokemonSpecies(id as number),
    enabled: id !== null,
  });
}

/**
 * Subset of `UseQueryResult` surface needed by analytics consumers. Returning a
 * narrow shape lets us safely synthesize placeholder entries for empty slots
 * without fighting TanStack's generic types.
 */
export interface BatchQueryEntry<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
}

const EMPTY_ENTRY: BatchQueryEntry<never> = {
  data: undefined,
  isLoading: false,
  isError: false,
};

/**
 * Fetches species for each roster slot, deduplicating identical ids so
 * TanStack Query doesn't flag multiple observers on the same key (which the
 * default `QueriesObserver` warns about and which would also waste network).
 */
export function useRosterSpecies(
  ids: readonly (number | null)[],
): BatchQueryEntry<PokemonSpecies>[] {
  // Serialize into a stable primitive key so the memo only re-runs when the
  // actual ids change, not on every fresh `roster.map(...)` array reference.
  const idsKey = ids.join("|");
  const uniqueIds = useMemo(
    () => Array.from(new Set(ids.filter((id): id is number => id !== null))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idsKey],
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: speciesQueryKey(id),
      queryFn: () => fetchPokemonSpecies(id),
    })),
  });

  return ids.map((id) => {
    if (id === null) return EMPTY_ENTRY;
    const idx = uniqueIds.indexOf(id);
    const q = queries[idx];
    return {
      data: q?.data as PokemonSpecies | undefined,
      isLoading: q?.isLoading ?? false,
      isError: q?.isError ?? false,
    };
  });
}

export function moveQueryKey(name: string | null): readonly unknown[] {
  return ["pokemon-move", name] as const;
}

export function useMove(name: string | null) {
  return useQuery<MoveInfo>({
    queryKey: moveQueryKey(name),
    queryFn: () => fetchMove(name as string),
    enabled: name !== null && name !== "",
  });
}

/**
 * Fetches move details for a list of names, deduplicating and skipping empties
 * so repeated moves (e.g. Protect on every slot) share a single observer.
 */
export function useMoves(
  names: readonly (string | null)[],
): BatchQueryEntry<MoveInfo>[] {
  const namesKey = names.join("|");
  const uniqueNames = useMemo(
    () =>
      Array.from(
        new Set(
          names.filter(
            (name): name is string => name !== null && name !== "",
          ),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [namesKey],
  );

  const queries = useQueries({
    queries: uniqueNames.map((name) => ({
      queryKey: moveQueryKey(name),
      queryFn: () => fetchMove(name),
    })),
  });

  return names.map((name) => {
    if (!name) return EMPTY_ENTRY;
    const idx = uniqueNames.indexOf(name);
    const q = queries[idx];
    return {
      data: q?.data as MoveInfo | undefined,
      isLoading: q?.isLoading ?? false,
      isError: q?.isError ?? false,
    };
  });
}
