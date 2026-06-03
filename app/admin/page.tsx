import type { Metadata } from "next";
import Link from "next/link";
import AdminQueue from "@/components/AdminQueue";
import PollPulse from "@/components/PollPulse";
import { getRealPollResults } from "@/lib/pollResults";
import { getCurrentAdmin, adminServiceClient, hasServiceKey } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin — Moderation Queue", robots: { index: false } };
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
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Moderation Queue</h1>
            <div className="flex gap-2">
              <Link href="/admin/pricing" className="btn-amber text-sm">Pricing &amp; plans →</Link>
              <Link href="/admin/ads" className="btn-outline text-sm">Ads →</Link>
            </div>
          </div>
          <p className="mt-1 text-slate-300">
            Signed in as {admin.email} · {total} item{total === 1 ? "" : "s"} awaiting action
          </p>
        </div>
      </section>
      <div className="container-page py-8">
        <AdminQueue data={data} />

        <section className="mt-12">
          <h2 className="section-title mb-3">Ad Performance · {period}</h2>
          {perfRows.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-100">
              No ad impressions recorded yet this month.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-100">
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
        </section>

        <PollPulse results={pollResults} />
      </div>
    </>
  );
}
