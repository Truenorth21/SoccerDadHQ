import type { Metadata } from "next";
import Link from "next/link";
import { getPricing, CLAIM_TIERS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Advertise & Upgrade — Reach Florida Soccer Families",
  description:
    "Advertise on SoccerDadHQ or upgrade your club, school, training center or coach profile. Featured placement, review responses, lead capture, analytics and newsletter sponsorships.",
};

// Read admin-edited pricing on every request so price changes in /admin/pricing
// show here immediately (otherwise this page bakes in defaults at build time).
export const dynamic = "force-dynamic";

export default async function AdvertisePage() {
  const pricing = await getPricing();
  const AD_PACKAGES = pricing.adPackages;
  const plans = Object.entries(pricing.claimPlans); // [type, {label, claim, featured}]
  const minClaim = Math.min(...plans.map(([, p]) => p.claim));
  const minFeatured = Math.min(...plans.map(([, p]) => p.featured));
  const tierPriceLabel: Record<string, string> = {
    free: "$0",
    claim: `from $${minClaim}`,
    featured: `from $${minFeatured}`,
  };
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-grad text-white">
        <div className="container-page py-16 sm:py-20">
          <span className="chip bg-white/10 text-amber-300 ring-1 ring-white/20">For clubs, schools, academies & businesses</span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Reach Florida soccer families where they're already looking
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">
            Thousands of parents use SoccerDadHQ to compare clubs, schools and coaches every week.
            Upgrade your profile or run an ad to put your program in front of them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#tiers" className="btn-amber">Upgrade your profile</a>
            <Link href="/advertise/order" className="btn-outline-light">Start an ad order</Link>
            <Link href="/partners" className="btn-outline-light">Premier Partners</Link>
          </div>
        </div>
      </section>

      {/* Profile plans */}
      <section id="tiers" className="container-page py-16">
        <div className="mb-2 text-center">
          <h2 className="section-title">Profile plans</h2>
          <p className="mt-1 text-slate-500">Free gets you listed. Paid plans help you win the families comparing you. Billed annually.</p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {CLAIM_TIERS.map((t) => {
            const highlight = t.key === "claim";
            return (
              <div key={t.key} className={`card flex flex-col p-6 ${highlight ? "ring-2 ring-brand-sky" : ""}`}>
                {highlight && (
                  <span className="mb-2 inline-block self-start rounded-full bg-brand-sky px-2.5 py-0.5 text-xs font-bold uppercase text-white">
                    Most popular
                  </span>
                )}
                <h3 className="font-heading text-2xl font-bold uppercase text-navy">{t.name}</h3>
                <p className="text-sm text-slate-500">{t.tagline}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-heading text-4xl font-bold text-navy">{tierPriceLabel[t.key]}</span>
                  {t.key !== "free" && <span className="mb-1 text-sm text-slate-500">/yr</span>}
                </div>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className={`flex gap-2 ${f.endsWith("plus:") ? "font-semibold text-navy" : "text-slate-600"}`}>
                      {!f.endsWith("plus:") && <span className="text-brand-sky">✓</span>}
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={t.key === "free" ? "/submit" : "/clubs"} className={`mt-6 ${highlight ? "btn-primary" : "btn-outline"}`}>
                  {t.key === "free" ? "Submit a free listing" : "Claim a profile"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Per-category pricing — exact annual price for each entity type */}
        <div className="mt-12">
          <h3 className="text-center font-heading text-xl font-bold uppercase text-navy">Annual price by category</h3>
          <p className="mt-1 text-center text-sm text-slate-500">Basic listing is always free. Prices below are per year to claim.</p>
          <div className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-heading uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-right font-heading uppercase tracking-wide">Claim</th>
                  <th className="px-4 py-3 text-right font-heading uppercase tracking-wide">Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map(([type, p]) => (
                  <tr key={type} className="even:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-navy">{p.label}</td>
                    <td className="px-4 py-3 text-right text-slate-700">${p.claim}<span className="text-xs text-slate-400">/yr</span></td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-blue">${p.featured}<span className="text-xs text-slate-400">/yr</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Open any profile and tap “Claim this profile” to pick a plan, apply a promo or referral code, and check out.
          </p>
        </div>
      </section>

      {/* Ad packages */}
      <section id="ads" className="bg-slate-100 py-16">
        <div className="container-page">
          <div className="mb-2 text-center">
            <h2 className="section-title">Advertising packages</h2>
            <p className="mt-1 text-slate-500">Local, contextual placements — clearly labeled, never spammy.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AD_PACKAGES.map((p) => (
              <div key={p.name} className="card p-5">
                <h3 className="font-heading text-lg font-bold text-navy">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
                <p className="mt-3 font-heading text-sm font-bold uppercase tracking-wide text-brand-blue">{p.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/advertise/order" className="btn-primary">Start a pre-paid ad order</Link>
            <Link href="/partners" className="btn-outline">Explore annual Premier Partnerships</Link>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Bundle any two placements for 15% off. Photographers, equipment brands, camps, tournaments and
            training businesses welcome.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="container-page py-16">
        <div className="overflow-hidden rounded-2xl bg-navy p-8 text-center text-white sm:p-12">
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight">Let's talk</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-300">
            Tell us about your program or business and we'll put together a plan. Most advertisers are live
            within a couple of business days.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="mailto:advertise@soccerdadhq.com?subject=Advertising%20%26%20Upgrades" className="btn-amber">
              Email advertise@soccerdadhq.com
            </a>
            <Link href="/clubs" className="btn-outline-light">
              Claim your profile
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
