export function AppHeader() {
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
            <span className="mono text-[11px] uppercase tracking-[0.3em] text-fg">
              VGC // ANALYZER
            </span>
            <span className="label mono text-fg-muted">
              GEN 9 / CHAMPIONS · DETERMINISTIC MATH ENGINE
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Stat label="ENGINE" value="v1.0" />
          <Stat label="MODE" value="VGC" />
          <Stat label="STATUS" value="LIVE" highlight />
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-end">
      <span className="label text-fg-muted">{label}</span>
      <span className={`mono text-xs tracking-wider ${highlight ? "text-accent" : "text-fg"}`}>
        {value}
      </span>
    </div>
  );
}
