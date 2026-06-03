import type { Metadata } from "next";
import Link from "next/link";
import Crest from "@/components/Crest";
import { Stars } from "@/components/Stars";
import { getClubBySlug, getSchoolBySlug } from "@/lib/data";
import { CLUB_REVIEW_CATEGORIES, SCHOOL_REVIEW_CATEGORIES, regionName } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Compare — SoccerDadHQ",
  description: "Compare Florida youth soccer clubs and high school programs side by side.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { type?: string; slugs?: string };
}) {
  const type = searchParams.type === "school" ? "school" : "club";
  const slugs = (searchParams.slugs ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);

  const items = (type === "club"
    ? await Promise.all(slugs.map((s) => getClubBySlug(s)))
    : await Promise.all(slugs.map((s) => getSchoolBySlug(s)))
  ).filter(Boolean) as any[];

  const cats = type === "club" ? CLUB_REVIEW_CATEGORIES : SCHOOL_REVIEW_CATEGORIES;

  // Build the comparison rows (label + value-per-item).
  const factRows: { label: string; cell: (x: any) => string }[] =
    type === "club"
      ? [
          { label: "Region", cell: (c) => regionName(c.region) },
          { label: "City", cell: (c) => `${c.city}, FL` },
          { label: "Top league", cell: (c) => c.leagues[0] ?? "—" },
          { label: "Age groups", cell: (c) => `${c.age_groups[0]}–${c.age_groups[c.age_groups.length - 1]}` },
          { label: "Programs", cell: (c) => c.genders.join(", ") },
          { label: "Tryouts", cell: (c) => (c.tryouts_open ? "Open" : "Closed") },
        ]
      : [
          { label: "Region", cell: (s) => regionName(s.region) },
          { label: "City", cell: (s) => `${s.city}, FL` },
          { label: "Class", cell: (s) => s.fhsaa_class },
          { label: "Type", cell: (s) => s.type },
          { label: "Programs", cell: (s) => s.programs.join(", ") },
          { label: "State titles", cell: (s) => String(s.state_titles) },
        ];

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Compare {type === "club" ? "Clubs" : "Schools"}
          </h1>
          <p className="mt-1 text-slate-300">Side-by-side on ratings and key facts.</p>
        </div>
      </section>

      <div className="container-page py-8">
        {items.length < 2 ? (
          <div className="card p-12 text-center">
            <p className="font-heading text-xl font-bold text-navy">Pick at least two to compare</p>
            <p className="mt-1 text-slate-500">Tap the ⇄ compare icon on any club or school card, then open the compare tray.</p>
            <Link href={type === "club" ? "/clubs" : "/schools"} className="btn-primary mt-4">
              Browse {type === "club" ? "clubs" : "schools"}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 p-3" />
                  {items.map((x) => (
                    <th key={x.slug} className="bg-slate-50 p-4 text-center align-top">
                      <Link href={`/${type === "club" ? "clubs" : "schools"}/${x.slug}`} className="flex flex-col items-center gap-2 hover:opacity-80">
                        <Crest name={x.name} color={x.logo_color} size="md" />
                        <span className="font-heading text-base font-bold text-navy">{x.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sticky left-0 z-10 bg-white p-3 font-heading text-sm font-bold uppercase text-slate-500">Overall</td>
                  {items.map((x) => (
                    <td key={x.slug} className="border-t border-slate-100 p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-heading text-2xl font-bold text-amber-700">{x.rating.toFixed(1)}</span>
                        <Stars value={x.rating} size="sm" />
                        <span className="text-xs text-slate-400">{x.review_count} reviews</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {cats.map((cat) => {
                  const max = Math.max(...items.map((x) => x.scores[cat.key] ?? 0));
                  return (
                    <tr key={cat.key}>
                      <td className="sticky left-0 z-10 bg-white p-3 font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">{cat.label}</td>
                      {items.map((x) => {
                        const v = x.scores[cat.key] ?? 0;
                        const best = v === max && items.length > 1;
                        return (
                          <td key={x.slug} className="border-t border-slate-100 p-4 text-center">
                            <span className={`font-heading text-lg font-bold ${best ? "text-emerald-600" : "text-navy"}`}>{v.toFixed(1)}</span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {factRows.map((row) => (
                  <tr key={row.label}>
                    <td className="sticky left-0 z-10 bg-white p-3 font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">{row.label}</td>
                    {items.map((x) => (
                      <td key={x.slug} className="border-t border-slate-100 p-4 text-center text-sm text-navy">{row.cell(x)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
