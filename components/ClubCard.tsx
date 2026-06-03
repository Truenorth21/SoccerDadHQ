import Link from "next/link";
import Crest from "./Crest";
import { RatingBadge } from "./Stars";
import FavoriteButton from "./FavoriteButton";
import CompareButton from "./CompareButton";
import { regionName } from "@/lib/regions";
import type { Club } from "@/lib/types";

export default function ClubCard({ club }: { club: Club & { distance?: number } }) {
  return (
    <div className={`card card-hover group relative flex flex-col p-4 ${club.featured ? "ring-2 ring-brand-amber" : ""}`}>
      {club.featured && (
        <span className="absolute -top-2 left-3 z-[2] rounded-full bg-brand-amber px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-navy shadow-sm">
          ★ Featured
        </span>
      )}
      <Link href={`/clubs/${club.slug}`} className="absolute inset-0 z-[1]" aria-label={club.name} />
      <div className="absolute right-3 top-3 z-[2] flex gap-1.5">
        <CompareButton item={{ type: "club", slug: club.slug, name: club.name }} />
        <FavoriteButton
          floating
          item={{ type: "club", slug: club.slug, name: club.name, subtitle: `${club.city}, FL`, color: club.logo_color }}
        />
      </div>

      <div className="flex items-start gap-3 pr-[4.75rem]">
        <Crest name={club.name} color={club.logo_color} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-heading text-lg font-bold leading-tight text-navy group-hover:text-brand-sky">
              {club.name}
            </h3>
            {club.verified && (
              <svg className="h-4 w-4 shrink-0 text-brand-sky" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="truncate text-sm text-slate-500">
            {club.city}, FL · {regionName(club.region)}
            {club.distance !== undefined && (
              <span className="text-brand-blue"> · {club.distance.toFixed(0)} mi</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <RatingBadge value={club.rating} count={club.review_count} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {club.leagues.slice(0, 3).map((l) => (
          <span key={l} className="chip-sky">{l}</span>
        ))}
        {club.genders.map((g) => (
          <span key={g} className="chip">{g}</span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>{club.age_groups[0]}–{club.age_groups[club.age_groups.length - 1]}</span>
        {club.tryouts_open ? (
          <span className="chip-amber">Tryouts open</span>
        ) : (
          <span className="text-slate-400">Tryouts closed</span>
        )}
      </div>
    </div>
  );
}
