import { NextResponse } from "next/server";
import { getClubs, getSchools, getCoaches } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Lightweight typeahead — top matches per type for the navbar dropdown. */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ clubs: [], schools: [], coaches: [] });
  }
  return NextResponse.json({
    clubs: (await getClubs({ q })).slice(0, 5).map((c) => ({ name: c.name, slug: c.slug, sub: `${c.city}, FL` })),
    schools: (await getSchools({ q })).slice(0, 5).map((s) => ({ name: s.name, slug: s.slug, sub: `${s.mascot} · ${s.city}` })),
    coaches: (await getCoaches({ q })).slice(0, 5).map((c) => ({ name: c.name, slug: c.slug, sub: c.club_name ?? "" })),
  });
}
