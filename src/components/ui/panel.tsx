import type { ReactNode } from "react";

interface PanelProps {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({
  label,
  meta,
  children,
  className = "",
  bodyClassName = "",
}: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-header">
        <span className="label-strong">{label}</span>
        {meta ? <span className="label mono">{meta}</span> : null}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
