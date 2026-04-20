"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTeamStore } from "@/store/team-store";
import { formatShowdownTeam } from "./formatter";
import { parseShowdownTeam } from "./parser";

interface ShowdownModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "export" | "import";

export function ShowdownModal({ open, onClose }: ShowdownModalProps) {
  const roster = useTeamStore((state) => state.roster);
  const loadTeam = useTeamStore((state) => state.loadTeam);

  const [tab, setTab] = useState<Tab>("export");
  const [importText, setImportText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const exportText = useMemo(() => formatShowdownTeam(roster), [roster]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [exportText]);

  const handleImport = useCallback(() => {
    const result = parseShowdownTeam(importText);
    setWarnings(result.warnings);
    if (result.slots.length > 0) {
      loadTeam(result.slots);
    }
  }, [importText, loadTeam]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset the modal's transient state when it closes. This is the idiomatic
  // "reset state on prop change" pattern — cheaper than an effect cascade.
  const [trackedOpen, setTrackedOpen] = useState(open);
  if (trackedOpen !== open) {
    setTrackedOpen(open);
    if (!open) {
      setWarnings([]);
      setImportText("");
      setCopied(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Showdown import and export"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel-header">
          <div className="flex items-center gap-3">
            <span className="label-strong">SHOWDOWN I/O</span>
            <div className="flex gap-1">
              {(["export", "import"] as Tab[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  className={`label px-2 py-1 border ${
                    tab === option
                      ? "border-accent/60 text-accent bg-accent/10"
                      : "border-hairline text-fg-dim hover:text-fg"
                  }`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="label text-fg-muted hover:text-alert"
          >
            ESC / ×
          </button>
        </header>
        {tab === "export" ? (
          <div className="p-4 flex flex-col gap-3 min-h-0">
            <textarea
              readOnly
              value={exportText}
              className="mono text-[11px] text-fg-dim bg-void border border-hairline p-3 w-full h-72 resize-none"
              aria-label="Showdown export text"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="label px-3 py-2 border border-accent/60 text-accent bg-accent/10 hover:bg-accent/20"
              >
                {copied ? "COPIED" : "COPY TO CLIPBOARD"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-3 min-h-0">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste Showdown text here..."
              className="mono text-[11px] text-fg bg-void border border-hairline p-3 w-full h-64 resize-none"
              aria-label="Showdown import text"
            />
            {warnings.length > 0 ? (
              <ul className="mono text-[10px] text-warn flex flex-col gap-0.5">
                {warnings.map((warning, i) => (
                  <li key={i}>! {warning}</li>
                ))}
              </ul>
            ) : null}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleImport}
                disabled={importText.trim().length === 0}
                className="label px-3 py-2 border border-accent/60 text-accent bg-accent/10 hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                LOAD TEAM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
