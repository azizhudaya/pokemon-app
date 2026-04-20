"use client";

import { useMoves } from "@/features/pokemon-data/hooks";
import { computeMoveBadges } from "@/features/move-badges/badges";
import { MoveBadge } from "@/features/move-badges/move-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import { humanizeSlug } from "@/lib/pokeapi/display";

interface MoveSummaryProps {
  moves: readonly (string | null)[];
  ability: string | null;
}

export function MoveSummary({ moves, ability }: MoveSummaryProps) {
  const queries = useMoves(moves);
  const hasAny = moves.some((move) => move);
  if (!hasAny) return null;

  return (
    <div className="flex flex-col gap-1 pt-2 border-t border-hairline">
      <span className="label-strong">MOVE DETAILS</span>
      <ul className="flex flex-col gap-1">
        {moves.map((name, i) => {
          if (!name) return null;
          const query = queries[i];
          const info = query?.data;
          return (
            <li
              key={i}
              className="flex items-center justify-between gap-2 mono text-[10px] text-fg-dim"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="label text-fg-muted w-5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-fg truncate">
                  {humanizeSlug(name).toUpperCase()}
                </span>
                {info ? <TypeBadge type={info.type} size="xs" /> : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {info ? (
                  <>
                    <span className="text-fg-muted">
                      {info.power !== null ? `P${info.power}` : "—"}
                    </span>
                    {computeMoveBadges(info, ability).map((badge) => (
                      <MoveBadge key={`${badge.kind}-${badge.label}`} badge={badge} />
                    ))}
                  </>
                ) : query?.isLoading ? (
                  <span className="text-fg-muted">...</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
