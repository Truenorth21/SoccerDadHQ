import type { Metadata } from "next";
import Link from "next/link";
import AdminQueue from "@/components/AdminQueue";
import PollPulse from "@/components/PollPulse";
import RevenueDashboard, { type RevenueSummary, type RevenueBucket } from "@/components/RevenueDashboard";
import RevenueLedger from "@/components/RevenueLedger";
import ClaimsAdmin from "@/components/ClaimsAdmin";
import CollapsibleSection from "@/components/CollapsibleSection";
import { getRealPollResults } from "@/lib/pollResults";
import { getCurrentAdmin, adminServiceClient, hasServiceKey } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin — Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

type RevCat = "ads" | "claims" | "partners" | "other";

/** Booked revenue across periods, by category. Auto: ad orders (invoiced/live/done)
 *  + approved/active profile claims. Manual: every revenue_entries row (partners,
 *  offline deals, anything). Monday-start weeks, UTC boundaries. */
function computeRevenue(
  adOrders: { estimate: number | null; status: string; created_at: string }[],
  claims: { plan_price: number | null; status: string; created_at: string }[],
  entries: { category: string; amount: number | null; occurred_at: string }[]
): RevenueSummary {
  const now = new Date();
  const y = now.getUTCFullYear(), mo = now.getUTCMonth(), d = now.getUTCDate();
  const todayStart = Date.UTC(y, mo, d);
  const dow = new Date(todayStart).getUTCDay(); // 0=Sun
  const weekStart = todayStart - ((dow + 6) % 7) * 86400000; // Monday-start week
  const monthStart = Date.UTC(y, mo, 1);
  const yearStart = Date.UTC(y, 0, 1);
  const empty = (): RevenueBucket => ({ ads: 0, claims: 0, partners: 0, other: 0, total: 0 });
  const rev: RevenueSummary = { today: empty(), week: empty(), month: empty(), ytd: empty(), all: empty() };

  const add = (cat: RevCat, amount: number, ts: number) => {
    if (!amount || Number.isNaN(ts)) return;
    const apply = (b: RevenueBucket) => { b[cat] += amount; b.total += amount; };
    apply(rev.all);
    if (ts >= yearStart) apply(rev.ytd);
    if (ts >= monthStart) apply(rev.month);
    if (ts >= weekStart) apply(rev.week);
    if (ts >= todayStart) apply(rev.today);
  };

  const AD_BOOKED = new Set(["invoiced", "live", "done"]);
  for (const o of adOrders) if (AD_BOOKED.has(o.status)) add("ads", Number(o.estimate ?? 0), +new Date(o.created_at));
  const CLAIM_BOOKED = new Set(["approved", "active"]);
  for (const c of claims) if (CLAIM_BOOKED.has(c.status)) add("claims", Number(c.plan_price ?? 0), +new Date(c.created_at));
  for (const e of entries) {
    const cat: RevCat = (["ads", "claims", "partners", "other"].includes(e.category) ? e.category : "other") as RevCat;
    // occurred_at is a date (YYYY-MM-DD); treat at UTC midnight.
    add(cat, Number(e.amount ?? 0), Date.parse(`${e.occurred_at}T00:00:00Z`));
  }
  return rev;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-3xl font-bold uppercase text-navy">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{children}</p>
      <Link href="/" className="btn-primary mt-5">Back home</Link>
    </div>
  );
}

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <Notice title="Admin needs Supabase">
        The moderation queue reads live submissions. Add your Supabase keys (and a{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code>) to enable it.
      </Notice>
    );
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    return (
      <Notice title="Admins only">
        You need to be signed in with an admin account. Set a user's <code>role</code> to{" "}
        <code>admin</code> in the <code>profiles</code> table, then{" "}
        <Link href="/login?next=/admin" className="font-semibold text-brand-blue hover:underline">log in</Link>.
      </Notice>
    );
  }

  const service = adminServiceClient();
  if (!service || !hasServiceKey) {
    return (
      <Notice title="Service key required">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to the environment so the queue can read and update
        submissions across tables.
      </Notice>
    );
  }

  // Fetch the queues (service role bypasses RLS).
  const [claims, submissions, commitments, adOrders, partners, reviews] = await Promise.all([
    service.from("claim_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    service.from("submissions").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    service.from("commitments").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    service.from("ad_orders").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    service.from("partner_inquiries").select("*").eq("status", "new").order("created_at", { ascending: false }),
    service.from("reviews").select("*").order("created_at", { ascending: false }).limit(25),
  ]);

  const data = {
    claims: claims.data ?? [],
    submissions: submissions.data ?? [],
    commitments: commitments.data ?? [],
    adOrders: adOrders.data ?? [],
    partners: partners.data ?? [],
    reviews: reviews.data ?? [],
  };
  const total = data.claims.length + data.submissions.length + data.commitments.length + data.adOrders.length + data.partners.length;

  // Revenue inputs — auto (ad orders + claims) plus the manual ledger.
  const [revAds, revClaims, revEntries] = await Promise.all([
    service.from("ad_orders").select("estimate,status,created_at"),
    service.from("claim_requests").select("plan_price,status,created_at"),
    service.from("revenue_entries").select("*").order("occurred_at", { ascending: false }),
  ]);
  const ledgerMissing = Boolean(
    revEntries.error && (revEntries.error.message?.includes("does not exist") || (revEntries.error as { code?: string }).code === "42P01")
  );
  const ledger = (revEntries.data ?? []) as any[];
  const revenue = computeRevenue((revAds.data ?? []) as any, (revClaims.data ?? []) as any, ledger);

  // Claimed profiles (ownership + expiry, Phase 3).
  const claimsRes = await service.from("profile_claims").select("*, profiles(email)").order("claimed_until", { ascending: true });
  const claimsMissing = Boolean(
    claimsRes.error && (claimsRes.error.message?.includes("does not exist") || (claimsRes.error as { code?: string }).code === "42P01")
  );
  const profileClaims = (claimsRes.data ?? []) as any[];

  // Ad performance for the current month.
  const period = new Date().toISOString().slice(0, 7);
  const { data: tallies } = await service
    .from("ad_event_tallies")
    .select("ad_id, type, n, period")
    .eq("period", period);
  const perf = new Map<string, { impressions: number; clicks: number }>();
  for (const row of (tallies ?? []) as { ad_id: string; type: string; n: number }[]) {
    const cur = perf.get(row.ad_id) ?? { impressions: 0, clicks: 0 };
    if (row.type === "impression") cur.impressions += Number(row.n);
    if (row.type === "click") cur.clicks += Number(row.n);
    perf.set(row.ad_id, cur);
  }
  const perfRows = Array.from(perf.entries())
    .map(([ad_id, v]) => ({ ad_id, ...v, ctr: v.impressions ? (v.clicks / v.impressions) * 100 : 0 }))
    .sort((a, b) => b.impressions - a.impressions);

  // Live poll votes (real, un-seeded) for the Poll Pulse panel.
  const pollResults = await getRealPollResults(service);

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Admin Dashboard</h1>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/clubs" className="btn-amber text-sm">Clubs →</Link>
              <Link href="/admin/schools" className="btn-amber text-sm">Schools →</Link>
              <Link href="/admin/coaches" className="btn-amber text-sm">Coaches →</Link>
              <Link href="/admin/listings" className="btn-amber text-sm">Listings →</Link>
              <Link href="/admin/marketing" className="btn-amber text-sm">Marketing →</Link>
              <Link href="/admin/messages" className="btn-amber text-sm">Messages →</Link>
              <Link href="/admin/newsletter" className="btn-amber text-sm">Newsletter →</Link>
              <Link href="/admin/pricing" className="btn-outline text-sm">Pricing &amp; plans →</Link>
              <Link href="/admin/ads" className="btn-outline text-sm">Ads →</Link>
            </div>
          </div>
          <p className="mt-1 text-slate-300">
            Signed in as {admin.email} · {total} item{total === 1 ? "" : "s"} awaiting action
          </p>
        </div>
      </section>
      <div className="container-page py-8">
        {/* Revenue first — the at-a-glance numbers */}
        <RevenueDashboard rev={revenue} />

        {/* Manual revenue ledger — partner deals & off-site revenue */}
        <CollapsibleSection title="Revenue ledger" subtitle="Log partner deals & revenue earned off the site" defaultOpen>
          <RevenueLedger entries={ledger} missing={ledgerMissing} />
        </CollapsibleSection>

        {/* Moderation queue — the main work area, stays open */}
        <div className="mt-10">
          <h2 className="section-title mb-3">Moderation queue</h2>
          <AdminQueue data={data} />
        </div>

        {/* Claimed profiles — ownership, expiry & promo/referral month grants */}
        <CollapsibleSection title="Claimed profiles" subtitle="Owners, expiry & free-month grants">
          <ClaimsAdmin claims={profileClaims} missing={claimsMissing} />
        </CollapsibleSection>

        {/* Detail panels — collapsed by default to keep the page tidy */}
        <CollapsibleSection title={`Ad performance · ${period}`} subtitle="Impressions, clicks & CTR this month">
          {perfRows.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
              No ad impressions recorded yet this month.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
              <table className="w-full bg-white text-sm">
                <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Ad</th>
                    <th className="px-4 py-2 text-right">Impressions</th>
                    <th className="px-4 py-2 text-right">Clicks</th>
                    <th className="px-4 py-2 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {perfRows.map((r) => (
                    <tr key={r.ad_id} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-navy">{r.ad_id}</td>
                      <td className="px-4 py-2 text-right">{r.impressions.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{r.clicks.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{r.ctr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Poll Pulse" subtitle="Live community vote results">
          <PollPulse results={pollResults} />
        </CollapsibleSection>
      </div>
    </>
  );
}
