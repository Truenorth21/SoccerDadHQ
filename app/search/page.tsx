import type { Metadata } from "next";
import Link from "next/link";
import ClubCard from "@/components/ClubCard";
import SchoolCard from "@/components/SchoolCard";
import CoachCard from "@/components/CoachCard";
import { getClubs, getSchools, getCoaches } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across Florida youth soccer clubs, high schools and coaches.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const clubs = q ? await getClubs({ q }) : [];
  const schools = q ? await getSchools({ q }) : [];
  const coaches = q ? await getCoaches({ q }) : [];
  const total = clubs.length + schools.length + coaches.length;

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"}
          </h1>
          <p className="mt-1 text-slate-300">
            {q ? `${total} match${total === 1 ? "" : "es"} across clubs, schools and coaches` : "Search clubs, high schools and coaches in one place."}
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        {!q ? (
          <p className="text-slate-500">Type a name, city, league or mascot in the search box above.</p>
        ) : total === 0 ? (
          <div className="card p-12 text-center">
            <p className="font-heading text-xl font-bold text-navy">No matches for &ldquo;{q}&rdquo;</p>
            <p className="mt-1 text-slate-500">Try a different name, city, or browse the directories.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/clubs" className="btn-outline">Clubs</Link>
              <Link href="/schools" className="btn-outline">Schools</Link>
              <Link href="/coaches" className="btn-outline">Coaches</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {clubs.length > 0 && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="section-title">Clubs <span className="text-slate-400">({clubs.length})</span></h2>
                  <Link href={`/clubs?q=${encodeURIComponent(q)}`} className="link-arrow">All club results →</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {clubs.slice(0, 6).map((c) => <ClubCard key={c.id} club={c} />)}
                </div>
              </section>
            )}
            {schools.length > 0 && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="section-title">Schools <span className="text-slate-400">({schools.length})</span></h2>
                  <Link href={`/schools?q=${encodeURIComponent(q)}`} className="link-arrow">All school results →</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {schools.slice(0, 6).map((s) => <SchoolCard key={s.id} school={s} />)}
                </div>
              </section>
            )}
            {coaches.length > 0 && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="section-title">Coaches <span className="text-slate-400">({coaches.length})</span></h2>
                  <Link href={`/coaches?q=${encodeURIComponent(q)}`} className="link-arrow">All coach results →</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {coaches.slice(0, 6).map((c) => <CoachCard key={c.id} coach={c} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
