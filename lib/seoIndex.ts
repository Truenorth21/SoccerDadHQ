import { getActiveTryouts, loadClubs, loadCoaches } from "./data";
import type { UsState } from "./states";
import type { Region } from "./regions";
import type { Club, Coach, Tryout } from "./types";

/* ------------------------------------------------------------------ *
 *  Which programmatic state / region pages have enough content to be
 *  indexed. Shared by the pages' robots meta and the sitemap so an
 *  empty page is never both noindexed and submitted to Google.
 * ------------------------------------------------------------------ */

export type SeoIndexData = { clubs: Club[]; coaches: Coach[]; tryouts: Tryout[] };

export async function loadSeoIndexData(): Promise<SeoIndexData> {
  const [clubs, coaches, tryouts] = await Promise.all([loadClubs(), loadCoaches(), getActiveTryouts()]);
  return { clubs, coaches, tryouts };
}

const stateOf = (x: { state?: string }) => (x.state || "FL").toUpperCase();

export const indexable = {
  clubs: (d: SeoIndexData, state: UsState, region?: Region) =>
    d.clubs.some((c) => stateOf(c) === state.code && (!region || c.region === region.key)),
  coaches: (d: SeoIndexData, state: UsState) => d.coaches.some((c) => stateOf(c) === state.code),
  /** Rankings list the state's clubs and coaches to vote on. */
  rankings: (d: SeoIndexData, state: UsState) => indexable.clubs(d, state) || indexable.coaches(d, state),
  /** A tryouts page shows posted tryout dates plus clubs flagged as tryouts-open. */
  tryouts: (d: SeoIndexData, state: UsState) =>
    d.tryouts.some((t) => stateOf(t) === state.code) || d.clubs.some((c) => stateOf(c) === state.code && c.tryouts_open),
};

export const hasClubs = async (state: UsState, region?: Region) => indexable.clubs(await loadSeoIndexData(), state, region);
export const hasCoaches = async (state: UsState) => indexable.coaches(await loadSeoIndexData(), state);
export const hasRankings = async (state: UsState) => indexable.rankings(await loadSeoIndexData(), state);
export const hasTryouts = async (state: UsState) => indexable.tryouts(await loadSeoIndexData(), state);
