import { adminServiceClient } from "./admin";

/** Two tiers only: a profile is either unclaimed or claimed. */
export type ProfileTier = "unclaimed" | "claimed";

export interface ClaimStatus {
  tier: ProfileTier;
  plan: string; // profile_claims.plan ("claim" / "featured" / …) or "free"
  claimedUntil: string | null;
}

const UNCLAIMED: ClaimStatus = { tier: "unclaimed", plan: "free", claimedUntil: null };

/**
 * Real ownership for a profile, read from `profile_claims` (the system of record —
 * claim approval writes here, NOT the entity's legacy `claimed` flag). An expired
 * claim resolves back to unclaimed. Degrades to unclaimed if the table/key is missing.
 */
export async function getClaimStatus(subjectType: string, slug: string): Promise<ClaimStatus> {
  const svc = adminServiceClient();
  if (!svc) return UNCLAIMED;
  try {
    const { data } = await svc
      .from("profile_claims")
      .select("plan, claimed_until")
      .eq("subject_type", subjectType)
      .eq("subject_slug", slug)
      .maybeSingle();
    if (!data) return UNCLAIMED;
    const until = data.claimed_until ? new Date(`${data.claimed_until}T00:00:00Z`).getTime() : null;
    if (until !== null && until < Date.now()) return { ...UNCLAIMED, claimedUntil: data.claimed_until ?? null };
    return { tier: "claimed", plan: data.plan ?? "claim", claimedUntil: data.claimed_until ?? null };
  } catch {
    return UNCLAIMED;
  }
}

/** Is this user the active (non-expired) owner of this profile? Gate every
 *  owner-editing action on this. */
export async function isProfileOwner(subjectType: string, slug: string, userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const svc = adminServiceClient();
  if (!svc) return false;
  try {
    const { data } = await svc
      .from("profile_claims")
      .select("owner_id, claimed_until")
      .eq("subject_type", subjectType)
      .eq("subject_slug", slug)
      .maybeSingle();
    if (!data || data.owner_id !== userId) return false;
    if (data.claimed_until && new Date(`${data.claimed_until}T00:00:00Z`).getTime() < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

/** Activate (or extend) ownership after a successful payment. Upserts the
 *  profile_claims row with a fresh 1-year window and resets reminder flags so
 *  the renewal cycle re-notifies. Idempotent on (subject_type, subject_slug),
 *  so a retried/duplicate webhook is safe. */
export async function activateClaim(opts: {
  subjectType: string;
  subjectSlug: string;
  ownerId: string | null;
  plan: string; // "claim" | "featured"
  months?: number;
}): Promise<{ ok: boolean; claimedUntil: string | null }> {
  const svc = adminServiceClient();
  if (!svc) return { ok: false, claimedUntil: null };
  const until = new Date();
  until.setUTCMonth(until.getUTCMonth() + (opts.months ?? 12));
  const claimedUntil = until.toISOString().slice(0, 10);
  const row: Record<string, unknown> = {
    subject_type: opts.subjectType,
    subject_slug: opts.subjectSlug,
    plan: opts.plan === "featured" ? "featured" : "claim",
    claimed_until: claimedUntil,
    reminded_30: false,
    reminded_7: false,
  };
  if (opts.ownerId) row.owner_id = opts.ownerId;
  const { error } = await svc.from("profile_claims").upsert(row, { onConflict: "subject_type,subject_slug" });
  return { ok: !error, claimedUntil };
}

/** Ownership tier comes from profile_claims ONLY — never the entity's legacy
 *  `claimed`/`featured` seed flags. Those are unverified demo data; trusting them
 *  would show "Featured / Managed by owner" on profiles nobody actually claimed
 *  (dishonest, the same way seeded reviews were). A profile is featured/claimed
 *  only once a real claim says so. */
export function resolveTier(claim: ClaimStatus): ProfileTier {
  return claim.tier;
}
