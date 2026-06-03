import Link from "next/link";
import Crest from "./Crest";
import { timeAgo } from "@/lib/utils";
import type { Commitment } from "@/lib/types";

const DEST_STYLE: Record<string, string> = {
  College: "bg-blue-50 text-brand-blue ring-blue-100",
  Pro: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "National Team": "bg-amber-50 text-amber-700 ring-amber-100",
};

export default function CommitmentCard({ commitment: c, showSource = true }: { commitment: Commitment; showSource?: boolean }) {
  const source = c.club_name
    ? { name: c.club_name, href: `/clubs/${c.club_slug}` }
    : c.school_name
    ? { name: c.school_name, href: `/schools/${c.school_slug}` }
    : null;

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <Crest name={c.player_name} color={c.color} size="sm" rounded="full" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold text-navy">{c.player_name}</p>
          <p className="text-xs text-slate-500">
            {c.position} · {c.gender} · Class of {c.grad_year}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${DEST_STYLE[c.dest_type]}`}>
          {c.dest_type}
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
        <span className="text-slate-400">→</span>
        <div className="min-w-0">
          <p className="truncate font-heading font-bold text-navy">{c.destination}</p>
          {c.division && <p className="text-xs text-slate-500">{c.division}</p>}
        </div>
      </div>

      {showSource && source && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
          <Link href={source.href} className="font-semibold text-brand-blue hover:underline">
            {source.name}
          </Link>
          <span className="text-slate-400">{timeAgo(c.date)}</span>
        </div>
      )}
    </div>
  );
}
