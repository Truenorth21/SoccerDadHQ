import type { Metadata } from "next";
import Link from "next/link";
import AdsEditor from "@/components/AdsEditor";
import AdPlacementsEditor from "@/components/AdPlacementsEditor";
import { getCurrentAdmin, hasServiceKey } from "@/lib/admin";
import { getAdsConfig } from "@/lib/adsServer";
import { getAdPlacements } from "@/lib/adPlacements";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin — Ads", robots: { index: false } };
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

export default async function AdminAdsPage() {
  if (!isSupabaseConfigured) {
    return <Notice title="Ads editor needs Supabase">Add your Supabase keys and a <code>SUPABASE_SERVICE_ROLE_KEY</code> to edit and persist ads.</Notice>;
  }
  const admin = await getCurrentAdmin();
  if (!admin) {
    return <Notice title="Admins only">Set your <code>profiles.role</code> to <code>admin</code> and <Link href="/login?next=/admin/ads" className="font-semibold text-brand-blue hover:underline">log in</Link>.</Notice>;
  }
  if (!hasServiceKey) {
    return <Notice title="Service key required">Add <code>SUPABASE_SERVICE_ROLE_KEY</code> so the editor can save.</Notice>;
  }

  const ads = await getAdsConfig();
  const placements = await getAdPlacements();

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <nav className="mb-2 text-sm text-slate-400">
            <Link href="/admin" className="hover:text-white">Admin</Link> <span className="text-slate-600">/</span>{" "}
            <span className="text-white">Ads</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Ad Inventory &amp; House Ads</h1>
          <p className="mt-1 text-slate-300">Manage paid sponsor ads and your house promos. Changes go live across every ad slot.</p>
        </div>
      </section>
      <div className="container-page py-8">
        <AdsEditor initial={ads} />

        <section className="mt-12">
          <h2 className="section-title mb-1">Google AdSense — fallback fill</h2>
          <p className="mb-4 text-sm text-slate-500">
            Each ad space follows a waterfall: a <strong>sold sponsor above shows first</strong>; if none is
            sold for that slot, <strong>Google AdSense</strong> fills it; affiliate &amp; house promos are the last
            resort. Paste an AdSense ad-unit slot ID and enable a category to turn on that fallback. One
            row per ad-slot category covers every position in it. Needs the <code>ad_placements</code> table
            (see <code>supabase/adsense-placements-migration.sql</code>).
          </p>
          <AdPlacementsEditor initial={placements} />
        </section>
      </div>
    </>
  );
}
