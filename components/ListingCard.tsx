import Link from "next/link";
import Crest from "./Crest";
import { RatingBadge } from "./Stars";
import { regionName } from "@/lib/regions";
import { KIND_CONFIG, type Listing } from "@/lib/listings";

export default function ListingCard({ listing: l }: { listing: Listing }) {
  const cfg = KIND_CONFIG[l.kind];
  return (
    <Link href={`${cfg.path}/${l.slug}`} className={`card card-hover group relative flex flex-col p-4 ${l.featured ? "ring-1 ring-amber-300 bg-amber-50/60" : ""}`}>
      {l.featured && (
        <span className="absolute -top-2 left-3 z-[2] rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 shadow-sm">
          ★ Featured
        </span>
      )}
      <div className="flex items-start gap-3">
        <Crest name={l.name} color={l.color} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-heading text-lg font-bold leading-tight text-navy group-hover:text-brand-sky">{l.name}</h3>
            {l.verified && (
              <svg className="h-4 w-4 shrink-0 text-brand-sky" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="truncate text-sm text-slate-500">{l.city}, FL · {regionName(l.region)}</p>
        </div>
      </div>
      <div className="mt-3">
        <RatingBadge value={l.rating} count={l.review_count} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {l.tags.map((t) => (
          <span key={t} className="chip-sky">{t}</span>
        ))}
      </div>
    </Link>
  );
}
