import ClaimForm from "./ClaimForm";
import type { ProfileTier } from "@/lib/claims";

/**
 * The one ownership panel every profile type uses, so claimed vs unclaimed looks
 * identical across clubs, coaches, schools and listings:
 *  - unclaimed → "Is this your {label}?" + claim form
 *  - claimed   → "✓ Managed by its owner" (no form)
 *  - featured  → "★ Featured profile" (no form)
 */
export default function ClaimPanel({
  tier,
  subjectType,
  slug,
  name,
  label,
  perk,
}: {
  tier: ProfileTier;
  subjectType: string;
  slug: string;
  name: string;
  label: string; // "club", "coach profile", "program", "training center"…
  perk?: string; // extra benefit line, e.g. "list private training"
}) {
  if (tier === "unclaimed") {
    return (
      <div className="card border-2 border-dashed border-slate-200 p-5 text-center">
        <h3 className="font-heading text-lg font-bold text-navy">Is this your {label}?</h3>
        <p className="mt-1 text-sm text-slate-500">
          Claim it to update info, respond to reviews{perk ? `, ${perk}` : ""} and stand out.
        </p>
        <div className="mt-3">
          <ClaimForm subjectType={subjectType} subjectSlug={slug} subjectName={name} />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 text-center">
      <h3 className="font-heading text-lg font-bold text-navy">✓ Managed by its owner</h3>
      <p className="mt-1 text-sm text-slate-500">
        A representative has claimed this profile and manages its details.
      </p>
    </div>
  );
}

/** Small inline ownership chip for the profile header. Nothing when unclaimed. */
export function OwnerChip({ tier }: { tier: ProfileTier }) {
  if (tier === "claimed") return <span className="chip-sky">✓ Managed by owner</span>;
  return null;
}
