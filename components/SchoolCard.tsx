import Link from "next/link";
import Crest from "./Crest";
import { RatingBadge } from "./Stars";
import FavoriteButton from "./FavoriteButton";
import CompareButton from "./CompareButton";
import { regionName } from "@/lib/regions";
import { hsAssociation } from "@/lib/states";
import type { School } from "@/lib/types";

export default function SchoolCard({ school }: { school: School & { distance?: number } }) {
  return (
    <div className="card card-hover group relative flex flex-col p-4">
      <Link href={`/schools/${school.slug}`} className="absolute inset-0 z-[1]" aria-label={school.name} />
      <div className="absolute right-3 top-3 z-[2] flex gap-1.5">
        <CompareButton item={{ type: "school", slug: school.slug, name: school.name }} />
        <FavoriteButton
          floating
          item={{ type: "school", slug: school.slug, name: school.name, subtitle: [school.mascot, `${school.city}, ${school.state}`].filter(Boolean).join(" · "), color: school.logo_color }}
        />
      </div>

      <div className="flex items-start gap-3 pr-[4.75rem]">
        <Crest name={school.name} color={school.logo_color} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-lg font-bold leading-tight text-navy group-hover:text-brand-sky">
            {school.name}
          </h3>
          <p className="truncate text-sm text-slate-500">
            {[school.mascot, `${school.city}, ${school.state}`].filter(Boolean).join(" · ")}
          </p>
          <p className="truncate text-xs text-slate-400">{regionName(school.region)}</p>
        </div>
      </div>

      <div className="mt-3">
        <RatingBadge value={school.rating} count={school.review_count} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {school.fhsaa_class && <span className="chip-sky">{school.fhsaa_class}</span>}
        <span className="chip">{school.type}</span>
        {school.programs.map((p) => (
          <span key={p} className="chip">{p}</span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        {school.distance !== undefined ? (
          <span className="text-brand-blue">{school.distance.toFixed(0)} mi away</span>
        ) : (
          <span>{school.district || `${school.city}, ${school.state}`}</span>
        )}
        {school.state_titles > 0 ? (
          <span className="chip-amber">🏆 {school.state_titles} state title{school.state_titles === 1 ? "" : "s"}</span>
        ) : (
          <span className="text-slate-400">{hsAssociation(school.state)} member</span>
        )}
      </div>
    </div>
  );
}
