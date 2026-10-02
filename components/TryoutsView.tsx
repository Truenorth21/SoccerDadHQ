import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClubCard from "@/components/ClubCard";
import AdSlot from "@/components/AdSlot";
import TryoutAlertSignup from "@/components/TryoutAlertSignup";
import { StateCrossLinks } from "@/components/StateLanding";
import { getActiveTryouts, getClubs } from "@/lib/data";
import { regionName } from "@/lib/regions";
import { seoCopy } from "@/lib/seo";
import { US_STATES, stateName, type UsState } from "@/lib/states";
import { formatDate } from "@/lib/utils";

/** Tryouts listing — national, or one state for /tryouts/[state]. Dates are only
 *  ever the ones clubs post themselves on their claimed profiles (no guesses). */
export default async function TryoutsView({ state }: { state?: UsState }) {
  const all = await getActiveTryouts();
  const tryouts = state ? all.filter((t) => (t.state ?? "FL") === state.code) : all;
  const openClubs = await getClubs({ state: state?.code, tryouts: "1" });
  const title = state ? seoCopy.tryoutsState(state).title : "Youth Soccer Tryouts";
  const place = state?.name ?? "your state";

  return (
    <>
      <Breadcrumbs items={state ? [{ label: "Tryouts", href: "/tryouts" }, { label: state.name }] : [{ label: "Tryouts" }]} />
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-slate-300">
            Tryout dates posted by the clubs themselves{state ? ` in ${state.name}` : ""}, soonest first — plus every club
            that has tryouts open right now.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="section-title mb-4">Upcoming tryout dates</h2>
          {tryouts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="font-heading text-lg font-bold text-navy">No tryout dates posted{state ? ` in ${state.name}` : ""} yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Clubs post dates from their claimed profile. Run a club?{" "}
                <Link href="/claim" className="font-semibold text-brand-sky hover:underline">Claim it free</Link> and add your next tryout.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {tryouts.map((t) => (
                <li key={t.id}>
                  <Link href={t.href ?? `/clubs/${t.club_slug}`} className="card card-hover flex items-center gap-4 p-4">
                    <span className="w-24 shrink-0 font-heading text-sm font-bold uppercase text-brand-amber">{formatDate(t.date)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-lg font-bold text-navy">{t.club_name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {t.city}, {t.state ?? "FL"}
                        {t.region ? ` · ${regionName(t.region)}` : ""}
                        {t.age_groups ? ` · ${t.age_groups}` : ""}
                        {t.gender ? ` · ${t.gender}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h2 className="section-title mb-4 mt-12">Clubs with tryouts open</h2>
          {openClubs.length === 0 ? (
            <p className="text-sm text-slate-500">No clubs{state ? ` in ${state.name}` : ""} have marked tryouts open yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {openClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          )}

          {state ? (
            <StateCrossLinks state={state} current="tryouts" />
          ) : (
            <section className="mt-12">
              <h2 className="section-title mb-4">Tryouts by state</h2>
              <div className="flex flex-wrap gap-2">
                {US_STATES.map((s) => (
                  <Link key={s.code} href={`/tryouts/${s.slug}`} className="chip-sky hover:underline">
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <TryoutAlertSignup state={state?.code} regionName={state ? stateName(state.code) : place} />
          <AdSlot placement="directory-sidebar" seed={7} />
        </aside>
      </div>
    </>
  );
}
