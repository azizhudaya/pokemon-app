"use client";

import { useCallback, useEffect, useState } from "react";
import { TEAM_TEMPLATES } from "@/data/templates";
import { useTeamStore } from "@/store/team-store";
import type { TeamTemplate } from "@/types/team";

interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
}

export function TemplatesModal({ open, onClose }: TemplatesModalProps) {
  const loadTeam = useTeamStore((state) => state.loadTeam);
  const roster = useTeamStore((state) => state.roster);
  const [pendingTemplate, setPendingTemplate] = useState<TeamTemplate | null>(null);

  const hasExistingRoster = roster.some((slot) => slot.speciesId !== null);

  const confirmAndLoad = useCallback(
    (template: TeamTemplate) => {
      loadTeam(template.slots);
      setPendingTemplate(null);
      onClose();
    },
    [loadTeam, onClose],
  );

  const handleChoose = useCallback(
    (template: TeamTemplate) => {
      if (hasExistingRoster) {
        setPendingTemplate(template);
      } else {
        confirmAndLoad(template);
      }
    },
    [hasExistingRoster, confirmAndLoad],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Load team template"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel max-w-3xl w-full max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel-header">
          <span className="label-strong">TEMPLATE LIBRARY</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="label text-fg-muted hover:text-alert"
          >
            ESC / ×
          </button>
        </header>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEAM_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleChoose(template)}
              className="text-left border border-hairline hover:border-accent/60 bg-void p-4 transition-colors flex flex-col gap-2"
            >
              <span className="mono text-[13px] tracking-widest uppercase text-accent">
                {template.name}
              </span>
              <span className="mono text-[12px] text-fg-dim leading-relaxed">
                {template.description}
              </span>
              <span className="label text-fg-muted">
                {template.slots
                  .map((s) => (s.speciesName ? s.speciesName.split("-")[0].toUpperCase() : ""))
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {pendingTemplate ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm overwrite"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-void/90"
          onClick={() => setPendingTemplate(null)}
        >
          <div
            className="panel max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="panel-header">
              <span className="label-strong text-warn">CONFIRM OVERWRITE</span>
            </header>
            <div className="p-4 flex flex-col gap-3">
              <p className="mono text-[13px] leading-relaxed text-fg-dim">
                Loading <span className="text-fg">{pendingTemplate.name}</span> will
                replace your current roster. This cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingTemplate(null)}
                  className="label px-3 py-2 border border-hairline text-fg-dim hover:text-fg"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => confirmAndLoad(pendingTemplate)}
                  className="label px-3 py-2 border border-alert/60 bg-alert/10 text-alert hover:bg-alert/20"
                >
                  OVERWRITE
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
