import { Stars } from "./Stars";
import { initials, timeAgo } from "@/lib/utils";
import type { Review } from "@/lib/types";

export default function ReviewList({
  reviews,
  categories,
}: {
  reviews: Review[];
  categories: readonly { key: string; label: string }[];
}) {
  if (!reviews.length) {
    return (
      <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
        No reviews yet. Be the first to share your experience.
      </p>
    );
  }
  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-heading text-sm font-bold text-white">
                {initials(r.author)}
              </span>
              <div>
                <p className="font-heading font-semibold text-navy">{r.author}</p>
                <p className="text-xs text-slate-400">
                  {r.relationship ? `${r.relationship} · ` : ""}
                  {timeAgo(r.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Stars value={r.rating} size="sm" />
              <span className="font-heading text-sm font-bold text-amber-700">{r.rating.toFixed(1)}</span>
            </div>
          </div>

          <h4 className="mt-3 font-heading text-lg font-bold text-navy">{r.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.body}</p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
            {categories.map((c) => {
              const v = (r.scores as unknown as Record<string, number>)[c.key];
              if (v === undefined) return null;
              return (
                <span key={c.key} className="text-xs text-slate-500">
                  {c.label} <span className="font-semibold text-navy">{v.toFixed(1)}</span>
                </span>
              );
            })}
          </div>

          {r.owner_reply && (
            <div className="mt-4 rounded-lg border-l-4 border-brand-sky bg-sky-50/60 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">Response from the owner</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{r.owner_reply}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
