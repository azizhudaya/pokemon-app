"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useUiStore } from "@/store/ui-store";

export function AppHeader() {
  const analyticsHidden = useUiStore((state) => state.analyticsHidden);
  const toggleAnalyticsHidden = useUiStore(
    (state) => state.toggleAnalyticsHidden,
  );

  const ToggleIcon = analyticsHidden ? PanelRightOpen : PanelRightClose;
  const toggleLabel = analyticsHidden
    ? "Show analytics panel"
    : "Hide analytics panel";

  return (
    <header className="border-b border-hairline bg-base/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="w-2 h-2 bg-accent"
            style={{ boxShadow: "0 0 8px var(--term-accent)" }}
          />
          <div className="flex flex-col">
            <span className="mono text-[13px] uppercase tracking-[0.3em] text-fg">
              VGC // ANALYZER
            </span>
            <span className="label mono text-fg-muted">
              GEN 9 / CHAMPIONS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Stat label="ENGINE" value="v1.0" />
            <Stat label="MODE" value="VGC" />
            <Stat label="STATUS" value="LIVE" highlight />
          </div>
          <button
            type="button"
            onClick={toggleAnalyticsHidden}
            aria-pressed={analyticsHidden}
            aria-label={toggleLabel}
            title={toggleLabel}
            className="hidden lg:inline-flex items-center justify-center w-9 h-9 border border-hairline text-fg-dim hover:text-accent hover:border-accent/60 transition-colors"
          >
            <ToggleIcon size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-end">
      <span className="label text-fg-muted">{label}</span>
      <span
        className={`mono text-sm tracking-wider ${highlight ? "text-accent" : "text-fg"}`}
      >
        {value}
      </span>
    </div>
  );
}
