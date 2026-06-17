import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Claim activated", robots: { index: false } };
export const dynamic = "force-dynamic";

const PROFILE_BASE: Record<string, string> = {
  club: "/clubs", school: "/schools", coach: "/coaches",
  "training-center": "/training-centers", facility: "/facilities", tournament: "/tournaments", camp: "/camps",
};

export default async function ClaimSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  let name: string | null = null;
  let profileHref: string | null = null;
  const stripe = getStripe();
  if (stripe && searchParams.session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      const m = s.metadata ?? {};
      name = m.subject_name || null;
      if (m.subject_type && m.subject_slug) profileHref = `${PROFILE_BASE[m.subject_type] ?? ""}/${m.subject_slug}`;
    } catch {
      /* ignore — show the generic confirmation */
    }
  }

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
      <h1 className="mt-5 font-heading text-3xl font-bold uppercase text-navy sm:text-4xl">Payment received</h1>
      <p className="mt-3 max-w-md text-slate-600">
        Thanks! {name ? <><strong>{name}</strong> is being activated</> : "Your profile is being activated"} — you&rsquo;ll get a
        confirmation email, and it will appear under <strong>Your claimed profiles</strong> on your dashboard within a minute.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className="btn-primary">Go to your dashboard →</Link>
        {profileHref && <Link href={profileHref} className="btn-outline">View the profile</Link>}
      </div>
      <p className="mt-4 text-xs text-slate-400">Receipt and billing details were emailed by Stripe.</p>
    </div>
  );
}
