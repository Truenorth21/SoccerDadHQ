import Link from "next/link";

const NOUNS: Record<string, string> = {
  club: "club",
  school: "high school",
  coach: "coach",
  "training-center": "training center",
  facility: "facility",
  tournament: "tournament",
  camp: "camp",
};

/** Crowdsourcing CTA shown in each directory: invites registered visitors to add a
 *  missing program. Deep-links to the submit form with the type pre-selected. */
export default function AddListingCTA({ kind, className = "" }: { kind: string; className?: string }) {
  const noun = NOUNS[kind] ?? "listing";
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-brand-sky/40 bg-brand-sky/5 p-6 text-center sm:flex-row sm:justify-between sm:text-left ${className}`}
    >
      <div>
        <h3 className="font-heading text-lg font-bold uppercase text-navy">Don’t see your {noun}?</h3>
        <p className="mt-0.5 text-sm text-slate-600">
          Help other families — add a {noun} that’s missing. We review every submission before it goes live.
        </p>
      </div>
      <Link href={`/submit?kind=${kind}`} className="btn-primary shrink-0 whitespace-nowrap">
        + Add a {noun}
      </Link>
    </div>
  );
}
