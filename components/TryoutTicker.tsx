import Link from "next/link";
import type { Tryout } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Continuous left-scrolling ticker of upcoming tryouts.
 *  Renders nothing when there are no active (future) tryouts. */
export default function TryoutTicker({ tryouts }: { tryouts: Tryout[] }) {
  if (!tryouts.length) return null;

  // Consistent, comfortable scroll speed regardless of how many listings
  // there are: scale the loop duration with the item count (~5s each).
  const durationSec = Math.max(28, tryouts.length * 6);

  const Item = ({ t }: { t: Tryout }) => (
    <Link
      href={`/clubs/${t.club_slug}`}
      className="mx-7 inline-flex items-center gap-2 whitespace-nowrap text-sm text-white/90 transition-colors hover:text-white"
    >
      <span aria-hidden>⚽</span>
      <span className="font-semibold text-white">{t.club_name}</span>
      <span className="text-white/40">·</span>
      <span>{t.age_groups}</span>
      <span className="text-white/40">·</span>
      <span>{t.city}, FL</span>
      <span className="text-white/40">·</span>
      <span className="text-brand-amber">{formatDate(t.date)}</span>
    </Link>
  );

  // One content group; rendered twice so the -50% loop is seamless.
  const Group = ({ hidden = false }: { hidden?: boolean }) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {tryouts.map((t) => (
        <Item key={t.id} t={t} />
      ))}
    </div>
  );

  return (
    <section className="border-b border-navy-700 bg-navy" aria-label="Upcoming tryout alerts">
      <div className="container-page flex h-9 items-center gap-0 overflow-hidden">
        {/* TRYOUTS badge */}
        <span className="z-10 -ml-1 flex h-9 shrink-0 items-center gap-2 bg-navy pr-4 font-heading text-xs font-bold uppercase tracking-[0.15em] text-brand-amber">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-amber opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-amber" />
          </span>
          Tryouts
        </span>

        {/* Scrolling track */}
        <div className="ticker-mask relative flex-1 overflow-hidden">
          <div
            className="animate-ticker flex w-max items-center"
            style={{ animationDuration: `${durationSec}s` }}
          >
            <Group />
            <Group hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
