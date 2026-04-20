/**
 * Format a PokéAPI slug (e.g. "iron-hands", "hi-jump-kick") into a display
 * string ("Iron Hands", "Hi Jump Kick"). PokéAPI never uses accented chars
 * in its slugs, so title-casing on hyphen boundaries is sufficient.
 */
export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part.length === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}
