import Link from "next/link";
import type { Metadata } from "next";
import { getPricing, CLAIM_TIERS, claimPriceFor } from "@/lib/pricing";

const PRICE_ORDER = ["coach", "school", "club", "camp", "training-center", "tournament", "facility"];
const fmt = (n: number) => (n <= 0 ? "Free" : `$${n % 1 === 0 ? n : n.toFixed(2)}/yr`);

export const metadata: Metadata = {
  title: "Claim your profile — manage your club, school or coach page",
  description:
    "Already listed on SoccerDadHQ? Claim your profile to edit your info, post tryout dates, respond to reviews and showcase commitments — in front of the Florida families comparing programs.",
};
export const revalidate = 3600;

const DIRECTORIES = [
  { href: "/clubs", label: "Find your club" },
  { href: "/schools", label: "Find your school" },
  { href: "/coaches", label: "Find your coach profile" },
  { href: "/training-centers", label: "Find your training center" },
];

const WHY = [
  { icon: "✍️", title: "Control your story", body: "Edit your description, leagues, contact links and logo so families see accurate, up-to-date info — not a placeholder." },
  { icon: "📣", title: "Post your tryout dates", body: "Add real tryout dates that show in the homepage ticker and your region's newsletter — right when parents are looking." },
  { icon: "💬", title: "Respond to reviews", body: "Reply publicly to parent reviews. A thoughtful response builds more trust than a perfect rating." },
  { icon: "📈", title: "See who's looking", body: "Your owner dashboard shows profile views, messages from families, and your community rank trend month over month." },
];

export default async function ClaimPage() {
  const pricing = await getPricing();
  // Effective per-type price (respects an active flat-fee promo).
  const byType = PRICE_ORDER
    .filter((t) => pricing.claimPlans[t])
    .map((t) => ({ type: t, label: pricing.claimPlans[t].label, price: claimPriceFor(pricing, t) }));
  const paid = byType.map((b) => b.price).filter((n) => n > 0);
  const minPaid = paid.length ? Math.min(...paid) : 0;
  const promoOn = !!pricing.flatPromo?.enabled;
  const priceLabel: Record<string, string> = { free: "$0", claim: `from ${fmt(minPaid)}`, featured: `from ${fmt(minPaid)}` };

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-grad text-white">
        <div className="container-page py-16 sm:py-20">
          <span className="chip bg-white/10 text-amber-300 ring-1 ring-white/20">For club directors, coaches & athletic directors</span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            This is your program&rsquo;s profile. Own it.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">
            Your club, school or coach page is already on SoccerDadHQ — where Florida families compare programs, read real
            reviews and look up tryouts. Claim it to manage your info, post tryout dates and respond to reviews, all in
            front of the parents already deciding.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#tiers" className="btn-amber">See plans &amp; pricing</a>
            <Link href="/clubs" className="btn-outline-light">Find your profile →</Link>
          </div>
        </div>
      </section>

      {/* Why claim */}
      <section className="container-page py-16">
        <h2 className="section-title">Why claim your profile</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="card p-5">
              <div className="text-3xl">{w.icon}</div>
              <h3 className="mt-3 font-heading text-lg font-bold text-navy">{w.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="section-title text-center">Plans</h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Being listed is always free. Claim — one paid plan with everything — is priced by program type.
          </p>
          {promoOn && (
            <p className="mx-auto mt-3 max-w-xl rounded-lg bg-brand-amber/15 px-4 py-2 text-center text-sm font-semibold text-amber-800 ring-1 ring-brand-amber/30">
              🎉 Limited-time: ${pricing.flatPromo!.price}/yr to claim any profile (coaches even less). Lock it in now.
            </p>
          )}
          <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
            {CLAIM_TIERS.map((t) => {
              const highlight = t.key === "claim";
              return (
                <div key={t.key} className={`card flex flex-col p-6 ${highlight ? "ring-2 ring-brand-sky" : ""}`}>
                  {highlight && <span className="mb-2 self-start rounded-full bg-brand-sky px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">Recommended</span>}
                  <h3 className="font-heading text-xl font-bold text-navy">{t.name}</h3>
                  <p className="text-sm text-slate-500">{t.tagline}</p>
                  <p className="mt-3 font-heading text-3xl font-bold text-brand-blue">{priceLabel[t.key]}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {t.features.map((f) => (
                      <li key={f} className={f.endsWith("plus:") ? "font-semibold text-navy" : "flex gap-2"}>
                        {!f.endsWith("plus:") && <span className="text-emerald-500">✓</span>}
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link href="/clubs" className={highlight ? "btn-primary w-full text-center" : "btn-outline w-full text-center"}>
                      {t.key === "free" ? "Browse the directory" : "Find your profile"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price by type */}
          <div className="mx-auto mt-8 max-w-md rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-500">Claim price by type</h3>
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {byType.map((b) => (
                <li key={b.type} className="flex items-center justify-between py-1.5">
                  <span className="text-slate-700">{b.label}</span>
                  <span className="font-semibold text-navy">{fmt(b.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-400">Public city/county/state facilities are free to claim (with confirmation).</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <h2 className="section-title text-center">How it works</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { n: 1, t: "Find your profile", b: "Search your program in the directory below — it's almost certainly already listed." },
            { n: 2, t: "Claim & activate", b: "Click “Claim this profile,” pick a plan, and pay securely. Your profile activates right away." },
            { n: 3, t: "Manage it", b: "Edit your info, post tryout dates, upload your logo and respond to reviews from your dashboard." },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy font-heading text-xl font-bold text-white">{s.n}</div>
              <h3 className="mt-3 font-heading text-lg font-bold text-navy">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {DIRECTORIES.map((d) => (
            <Link key={d.href} href={d.href} className="btn-outline">{d.label}</Link>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Claims are reviewed to confirm you represent the program. Cancel anytime; the listing stays free either way.
        </p>
      </section>
    </>
  );
}
