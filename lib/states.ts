/* ------------------------------------------------------------------ *
 *  US states — the top level of the national directory. `code` is what
 *  the DB stores (clubs.state, coaches.state, newsletter_subscribers.state);
 *  `slug` is what the SEO routes use (/clubs/texas, /rankings/north-carolina).
 * ------------------------------------------------------------------ */

export interface UsState {
  code: string; // "TX"
  name: string; // "Texas"
  slug: string; // "texas"
}

const NAMES: [string, string][] = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
];

export const US_STATES: UsState[] = NAMES.map(([code, name]) => ({
  code,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
}));

const BY_CODE = new Map(US_STATES.map((s) => [s.code, s]));
const BY_SLUG = new Map(US_STATES.map((s) => [s.slug, s]));

/** Look up a state by its two-letter code (case-insensitive). */
export function stateByCode(code: string | null | undefined): UsState | undefined {
  return code ? BY_CODE.get(code.toUpperCase()) : undefined;
}

/** Look up a state by its URL slug ("north-carolina"). */
export function stateBySlug(slug: string | null | undefined): UsState | undefined {
  return slug ? BY_SLUG.get(slug.toLowerCase()) : undefined;
}

/** Resolve a code, slug or full name to a state — for CSV imports and loose input. */
export function resolveState(input: string | null | undefined): UsState | undefined {
  if (!input) return undefined;
  const v = input.trim();
  return stateByCode(v) ?? stateBySlug(v.replace(/\s+/g, "-")) ?? US_STATES.find((s) => s.name.toLowerCase() === v.toLowerCase());
}

export function stateName(code: string | null | undefined): string {
  return stateByCode(code)?.name ?? code ?? "";
}
