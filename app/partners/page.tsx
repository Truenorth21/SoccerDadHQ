import type { Metadata } from "next";
import Link from "next/link";
import PartnerInquiryForm from "@/components/PartnerInquiryForm";
import { getPricing } from "@/lib/pricing";

// Re-read admin pricing each request so partner-tier price edits show immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premier Partner Program — Annual Marketing Partnerships",
  description:
    "SoccerDadHQ Premier Partner Program: annual Gold and Platinum bundles combining ad credits, featured placement, newsletter branding, commitment showcases and editorial coverage for Florida soccer organizations.",
};

const STEPS = [
  { n: "1", t: "Pick a tier", d: "Choose Gold or Platinum based on your goals and budget." },
  { n: "2", t: "Kickoff call", d: "We map your objectives and set an editorial calendar." },
  { n: "3", t: "Send assets", d: "Logos, creative and any content you want featured." },
  { n: "4", t: "Go live", d: "Your brand rolls out across the platform and newsletter." },
  { n: "5", t: "Ongoing coverage", d: "Editorial, social and reporting throughout the year." },
];

export default async function PartnersPage() {
  const pricing = await getPricing();
  const TIERS = pricing.partnerTiers;
  return (
    <>
      <section className="bg-hero-grad text-white">
        <div className="container-page py-16 sm:py-20">
          <nav className="mb-3 text-sm text-slate-300">
            <Link href="/advertise" className="hover:text-white">Advertise</Link>{" "}
            <span className="text-slate-500">/</span> <span className="text-white">Premier Partners</span>
          </nav>
          <span className="chip bg-white/10 text-amber-300 ring-1 ring-white/20">Annual partnerships</span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Premier Partner Program
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">
            One annual partnership that bundles everything — ad credits, featured placement, newsletter
            branding, commitment showcases and editorial coverage — managed for you, all year long.
          </p>
          <a href="#tiers" className="btn-amber mt-8">View partnership tiers</a>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-14">
        <h2 className="section-title text-center">How partnership works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-sky font-heading text-base font-bold text-white">{s.n}</span>
              <h3 className="mt-3 font-heading text-lg font-bold text-navy">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="bg-slate-100 py-14">
        <div className="container-page">
          <h2 className="section-title text-center">Partnership tiers</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-5 lg:grid-cols-2">
            {TIERS.map((t) => (
              <div key={t.name} className={`card flex flex-col p-6 ${t.highlight ? "ring-2 ring-brand-amber" : ""}`}>
                {t.highlight && (
                  <span className="mb-2 self-start rounded-full bg-brand-amber px-2.5 py-0.5 text-xs font-bold uppercase text-navy">Best value</span>
                )}
                <h3 className="font-heading text-3xl font-bold uppercase text-navy">{t.name}</h3>
                <div className="mt-2 flex items-end gap-1">
                  <span className="font-heading text-4xl font-bold text-navy">{t.price}</span>
                  <span className="mb-1 text-sm text-slate-500">{t.cadence}</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {t.features.map((ftxt) => (
                    <li key={ftxt} className={`flex gap-2 ${ftxt.endsWith("plus:") ? "font-semibold text-navy" : "text-slate-600"}`}>
                      {!ftxt.endsWith("plus:") && <span className="text-brand-amber">★</span>}
                      <span>{ftxt}</span>
                    </li>
                  ))}
                </ul>
                <a href="#inquire" className={`mt-6 ${t.highlight ? "btn-amber" : "btn-primary"}`}>Choose {t.name}</a>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Credits are redeemable against any ad placement. Prefer à la carte? Use the{" "}
            <Link href="/advertise/order" className="font-semibold text-brand-blue hover:underline">ad order form</Link> instead.
          </p>
        </div>
      </section>

      {/* Inquiry */}
      <section id="inquire" className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <PartnerInquiryForm />
        </div>
      </section>
    </>
  );
}
