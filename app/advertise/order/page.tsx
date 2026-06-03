import type { Metadata } from "next";
import Link from "next/link";
import AdOrderForm from "@/components/AdOrderForm";
import { getPricing } from "@/lib/pricing";

// Re-read admin pricing each request so ad-rate/package edits show immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advertising Order Form — Pre-Paid Ad Submission",
  description:
    "Order a banner or newsletter ad campaign on SoccerDadHQ. Choose your placement, impressions and geo-targeting, see an instant estimate, and submit a pre-paid order.",
};

export default async function AdOrderPage() {
  const pricing = await getPricing();
  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <nav className="mb-2 text-sm text-slate-400">
            <Link href="/advertise" className="hover:text-white">Advertise</Link> <span className="text-slate-600">/</span>{" "}
            <span className="text-white">Order form</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Advertising Order Form
          </h1>
          <p className="mt-1 max-w-2xl text-slate-300">
            Build your campaign, see an instant estimate, and submit a pre-paid order. We'll send an invoice
            to confirm — your ad goes live once payment clears and creative is approved.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <AdOrderForm rates={pricing.adRates} />
        <p className="mt-6 text-center text-xs text-slate-400">
          Prefer to talk it through first? Email{" "}
          <a href="mailto:advertise@soccerdadhq.com" className="font-semibold text-brand-blue hover:underline">advertise@soccerdadhq.com</a>{" "}
          or explore the <Link href="/partners" className="font-semibold text-brand-blue hover:underline">Premier Partner Program</Link>.
        </p>
      </div>
    </>
  );
}
