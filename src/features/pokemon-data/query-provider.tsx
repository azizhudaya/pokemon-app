"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  type Persister,
} from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get, set, del } from "idb-keyval";

/**
 * A QueryClient tuned for static PokéAPI data:
 * - Data is immutable for the session (Pokémon stats don't change).
 * - Queries persist to IndexedDB via idb-keyval so reloads are offline-friendly.
 * - 7-day GC so infrequently used entries get cleaned up over time.
 */
function buildQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24 * 7,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });
}

function buildPersister(): Persister {
  return createAsyncStoragePersister({
    storage: {
      getItem: async (key) => (await get<string>(key)) ?? null,
      setItem: async (key, value) => {
        await set(key, value);
      },
      removeItem: async (key) => {
        await del(key);
      },
    },
    key: "vgc-analyzer:query-cache",
    throttleTime: 1000,
  });
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => buildQueryClient());
  // Build the persister lazily inside the state initializer so it runs once
  // (client-only). During SSR pre-render window is absent; we fall back to a
  // non-persisted provider to match server output, then rehydrate on client.
  const [persister] = useState<Persister | null>(() =>
    typeof window === "undefined" ? null : buildPersister(),
  );

  if (!persister) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        buster: "v1",
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
