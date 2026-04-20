import type { EVSpread, TeamSlot } from "@/types/team";
import { humanizeSlug } from "@/lib/pokeapi/display";

const EV_ORDER: Array<[keyof EVSpread, string]> = [
  ["hp", "HP"],
  ["attack", "Atk"],
  ["defense", "Def"],
  ["specialAttack", "SpA"],
  ["specialDefense", "SpD"],
  ["speed", "Spe"],
];

function formatEvs(evs: EVSpread): string | null {
  const parts = EV_ORDER.filter(([key]) => evs[key] > 0).map(
    ([key, label]) => `${evs[key]} ${label}`,
  );
  return parts.length === 0 ? null : parts.join(" / ");
}

function titleCase(type: string): string {
  return type.length === 0 ? type : type[0].toUpperCase() + type.slice(1);
}

export function formatShowdownSlot(slot: TeamSlot): string | null {
  if (!slot.speciesName) return null;
  const lines: string[] = [];

  const species = humanizeSlug(slot.speciesName);
  const header = slot.item ? `${species} @ ${slot.item}` : species;
  lines.push(header);

  if (slot.ability) lines.push(`Ability: ${slot.ability}`);
  if (slot.level !== 50) lines.push(`Level: ${slot.level}`);
  if (slot.teraType) lines.push(`Tera Type: ${titleCase(slot.teraType)}`);

  const evs = formatEvs(slot.evs);
  if (evs) lines.push(`EVs: ${evs}`);
  if (slot.nature !== "Hardy") lines.push(`${slot.nature} Nature`);

  for (const move of slot.moves) {
    if (!move) continue;
    lines.push(`- ${humanizeSlug(move)}`);
  }

  return lines.join("\n");
}

export function formatShowdownTeam(roster: readonly TeamSlot[]): string {
  return roster
    .map(formatShowdownSlot)
    .filter((text): text is string => text !== null)
    .join("\n\n");
}
