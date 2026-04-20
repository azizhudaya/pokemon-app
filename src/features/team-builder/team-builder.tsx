"use client";

import { useMemo, useState } from "react";
import { useTeamStore, TEAM_SIZE } from "@/store/team-store";
import { RosterSlot } from "./roster-slot";
import { TemplatesModal } from "@/features/templates/templates-modal";
import { ShowdownModal } from "@/features/showdown-io/showdown-modal";

export function TeamBuilder() {
  const roster = useTeamStore((state) => state.roster);
  const clearTeam = useTeamStore((state) => state.clearTeam);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [showdownOpen, setShowdownOpen] = useState(false);

  const filledCount = useMemo(
    () => roster.filter((slot) => slot.speciesId !== null).length,
    [roster],
  );

  return (
    <section aria-label="Team builder" className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="label-strong">TEAM BUILDER</h2>
          <p className="mono text-[10px] text-fg-muted tracking-widest uppercase mt-1">
            Roster // {String(filledCount).padStart(2, "0")}/{String(TEAM_SIZE).padStart(2, "0")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplatesOpen(true)}
            className="label text-fg-dim hover:text-accent transition-colors px-2 py-1 border border-hairline"
          >
            TEMPLATES
          </button>
          <button
            type="button"
            onClick={() => setShowdownOpen(true)}
            className="label text-fg-dim hover:text-accent transition-colors px-2 py-1 border border-hairline"
          >
            IMPORT / EXPORT
          </button>
          {filledCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear the entire team?")) clearTeam();
              }}
              className="label text-fg-muted hover:text-alert transition-colors px-2 py-1 border border-hairline"
            >
              CLEAR TEAM
            </button>
          ) : null}
        </div>
      </header>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: TEAM_SIZE }).map((_, i) => (
          <RosterSlot key={i} index={i} />
        ))}
      </div>
      <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      <ShowdownModal open={showdownOpen} onClose={() => setShowdownOpen(false)} />
    </section>
  );
}
