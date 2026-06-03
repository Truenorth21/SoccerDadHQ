"use client";

import Link from "next/link";
import Crest from "./Crest";
import { useFavorites } from "@/lib/favorites";

const TYPE_LABEL: Record<string, string> = { club: "Club", school: "School", coach: "Coach" };
const TYPE_PATH: Record<string, string> = { club: "/clubs", school: "/schools", coach: "/coaches" };

export default function FavoritesPanel() {
  const { favorites, toggle } = useFavorites();

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Saved Favorites</h2>
        <span className="text-sm text-slate-500">{favorites.length} saved</span>
      </div>

      {favorites.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">
            You haven't saved anything yet. Tap the ♥ on any club, school or coach to save it here.
          </p>
          <Link href="/clubs" className="btn-primary mt-4">Browse clubs</Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {favorites.map((f) => (
            <li key={`${f.type}-${f.slug}`} className="card flex items-center gap-3 p-3">
              <Crest name={f.name} color={f.color ?? "#1a4fa0"} size="sm" rounded={f.type === "coach" ? "full" : "lg"} />
              <Link href={`${TYPE_PATH[f.type]}/${f.slug}`} className="min-w-0 flex-1 hover:opacity-80">
                <p className="truncate font-heading font-bold text-navy">{f.name}</p>
                <p className="truncate text-xs text-slate-500">
                  <span className="chip mr-1">{TYPE_LABEL[f.type]}</span>
                  {f.subtitle}
                </p>
              </Link>
              <button
                onClick={() => toggle(f)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-red-500"
                aria-label={`Remove ${f.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
