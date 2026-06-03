import Link from "next/link";
import Crest from "./Crest";
import { RatingBadge } from "./Stars";
import FavoriteButton from "./FavoriteButton";
import { regionName } from "@/lib/regions";
import type { Coach } from "@/lib/types";

export default function CoachCard({ coach }: { coach: Coach }) {
  return (
    <div className={`card card-hover group relative flex flex-col p-4 ${coach.featured ? "ring-2 ring-brand-amber" : ""}`}>
      {coach.featured && (
        <span className="absolute -top-2 left-3 z-[2] rounded-full bg-brand-amber px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-navy shadow-sm">
          ★ Featured
        </span>
      )}
      <Link href={`/coaches/${coach.slug}`} className="absolute inset-0 z-[1]" aria-label={coach.name} />
      <div className="absolute right-3 top-3 z-[2]">
        <FavoriteButton
          floating
          item={{ type: "coach", slug: coach.slug, name: coach.name, subtitle: coach.title, color: coach.photo_color }}
        />
      </div>

      <div className="flex items-start gap-3 pr-9">
        <Crest name={coach.name} color={coach.photo_color} size="md" rounded="full" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-lg font-bold leading-tight text-navy group-hover:text-brand-sky">
            {coach.name}
          </h3>
          <p className="truncate text-sm text-slate-500">{coach.title}</p>
          <p className="truncate text-xs text-slate-400">
            {coach.club_name} · {regionName(coach.region)}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <RatingBadge value={coach.rating} count={coach.review_count} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {coach.specialties.slice(0, 2).map((s) => (
          <span key={s} className="chip">{s}</span>
        ))}
        {coach.private_training && <span className="chip-amber">Private training</span>}
      </div>
    </div>
  );
}
