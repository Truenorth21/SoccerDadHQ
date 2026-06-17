import Link from "next/link";
import Crest from "./Crest";
import { RatingBadge } from "./Stars";
import FavoriteButton from "./FavoriteButton";
import CompareButton from "./CompareButton";
import { regionName } from "@/lib/regions";
import type { Club } from "@/lib/types";

export default function ClubCard({ club }: { club: Club & { distance?: number } }) {
  return (
    <div className="card card-hover group relative flex flex-col p-4">
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
