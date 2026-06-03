import type { Metadata } from "next";
import Link from "next/link";
import PricingEditor from "@/components/PricingEditor";
import { getCurrentAdmin, hasServiceKey } from "@/lib/admin";
import { getPricing } from "@/lib/pricing";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin — Pricing", robots: { index: false } };
export const dynamic = "force-dynamic";

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-3xl font-bold uppercase text-navy">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{children}</p>
      <Link href="/" className="btn-primary mt-5">Back home</Link>
    </div>
  );
}

export default async function AdminPricingPage() {
  if (!isSupabaseConfigured) {
    return <Notice title="Pricing editor needs Supabase">Add your Supabase keys and a <code>SUPABASE_SERVICE_ROLE_KEY</code> to edit and persist pricing.</Notice>;
  }
  const admin = await getCurrentAdmin();
  if (!admin) {
    return <Notice title="Admins only">Set your <code>profiles.role</code> to <code>admin</code> and <Link href="/login?next=/admin/pricing" className="font-semibold text-brand-blue hover:underline">log in</Link>.</Notice>;
  }
  if (!hasServiceKey) {
    return <Notice title="Service key required">Add <code>SUPABASE_SERVICE_ROLE_KEY</code> so the editor can save.</Notice>;
  }

  const pricing = await getPricing();

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <nav className="mb-2 text-sm text-slate-400">
            <Link href="/admin" className="hover:text-white">Admin</Link> <span className="text-slate-600">/</span>{" "}
            <span className="text-white">Pricing</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Pricing &amp; Plans</h1>
          <p className="mt-1 text-slate-300">Edit profile tiers, Premier Partner bundles, ad packages and CPM rates. Saved values override the code defaults everywhere.</p>
        </div>
      </section>
      <div className="container-page py-8">
        <PricingEditor initial={pricing} />
      </div>
    </>
  );
}
