"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ClientOnly } from "@/components/ui/client-only";
import { TeamBuilder } from "@/features/team-builder/team-builder";
import { AnalyticsColumn } from "@/features/analytics/analytics-column";

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3 min-h-[480px] justify-center items-center">
      <span className="label mono text-fg-muted cursor-blink">
        BOOTING VGC TERMINAL
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6">
        <ClientOnly
          fallback={
            <div className="lg:col-span-2">
              <PageSkeleton />
            </div>
          }
        >
          <div className="min-w-0">
            <TeamBuilder />
          </div>
          <aside className="min-w-0">
            <AnalyticsColumn />
          </aside>
        </ClientOnly>
      </main>
      <footer className="border-t border-hairline py-4">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          <span className="label mono text-fg-muted">
            STATIC · CLIENT-SIDE · POKÉAPI CACHED VIA INDEXEDDB
          </span>
          <span className="label mono text-fg-muted">NO AI · NO SERVER</span>
        </div>
      </footer>
    </div>
  );
}
