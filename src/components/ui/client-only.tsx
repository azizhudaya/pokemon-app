"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function noopSubscribe() {
  return () => {};
}

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders `children` only after client hydration has committed.
 *
 * During server rendering and the first client render, React uses
 * `getServerSnapshot` (false) which emits `fallback`, guaranteeing the server
 * HTML and the initial client tree match. After hydration, the store snapshot
 * flips to `true` and the real tree mounts.
 *
 * Use this to wrap subtrees whose state depends on client-only side effects
 * (IndexedDB, localStorage, window APIs) where SSR otherwise produces a
 * mismatched shell.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return <>{isHydrated ? children : fallback}</>;
}
