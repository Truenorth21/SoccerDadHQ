import Link from "next/link";
import Crest from "./Crest";
import { RatingBadge } from "./Stars";
import { regionName } from "@/lib/regions";
import { KIND_CONFIG, type Listing } from "@/lib/listings";

export default function ListingCard({ listing: l }: { listing: Listing }) {
  const cfg = KIND_CONFIG[l.kind];
  return (
    <Link href={`${cfg.path}/${l.slug}`} className="card card-hover group relative flex flex-col p-4">
      <div className="flex items-start gap-3">
        <Crest name={l.name} color={l.color} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-heading text-lg font-bold leading-tight text-navy group-hover:text-brand-sky">{l.name}</h3>
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
