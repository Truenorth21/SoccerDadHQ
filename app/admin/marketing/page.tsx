import type { Metadata } from "next";
import Link from "next/link";
import MarketingLedger from "@/components/MarketingLedger";
import { getCurrentAdmin, adminServiceClient, hasServiceKey } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin — Marketing", robots: { index: false } };
export const dynamic = "force-dynamic";

type Visit = {
  session_id: string | null;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  created_at: string;
};

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-3xl font-bold uppercase text-navy">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{children}</p>
      <Link href="/admin" className="btn-primary mt-5">Back to admin</Link>
    </div>
  );
}

function refHost(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    return h.includes("soccerdadhq") ? null : h;
  } catch {
    return null;
  }
}
const sourceOf = (v: Visit) => v.utm_source || refHost(v.referrer) || "Direct";

/** Top dimension by unique visitors (distinct session). */
function topBy(visits: Visit[], keyFn: (v: Visit) => string | null, limit = 8) {
  const m = new Map<string, Set<string>>();
  for (const v of visits) {
    const k = keyFn(v);
    if (!k) continue;
    const sid = v.session_id ?? `anon-${v.created_at}`;
    (m.get(k) ?? m.set(k, new Set()).get(k)!).add(sid);
  }
  return Array.from(m.entries())
    .map(([k, s]) => ({ k, visitors: s.size }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, limit);
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="font-heading text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-navy">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function RankTable({ title, rows, empty }: { title: string; rows: { k: string; visitors: number }[]; empty: string }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-heading text-lg font-bold uppercase text-navy">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {rows.map((r) => (
            <li key={r.k} className="flex items-center justify-between">
              <span className="truncate text-navy">{r.k}</span>
              <span className="font-heading font-bold text-brand-blue">{r.visitors.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminMarketingPage() {
  if (!isSupabaseConfigured) return <Notice title="Admin needs Supabase">Add your Supabase keys to use marketing.</Notice>;
  const admin = await getCurrentAdmin();
  if (!admin) return <Notice title="Admins only">Log in with an admin account first.</Notice>;
  const service = adminServiceClient();
  if (!service || !hasServiceKey) return <Notice title="Service key required">Add <code>SUPABASE_SERVICE_ROLE_KEY</code>.</Notice>;

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [visitsRes, campaignsRes] = await Promise.all([
    service.from("visits").select("session_id,path,referrer,utm_source,utm_medium,utm_campaign,city,region,country,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(20000),
    service.from("marketing_campaigns").select("*").order("created_at", { ascending: false }),
  ]);
  const missing = Boolean(
    visitsRes.error && (visitsRes.error.message?.includes("does not exist") || (visitsRes.error as { code?: string }).code === "42P01")
  );
  const visits = (visitsRes.data ?? []) as Visit[];
  const campaigns = (campaignsRes.data ?? []) as Record<string, any>[];

  // Overview
  const sessions = new Set(visits.map((v) => v.session_id).filter(Boolean));
  const todayStart = (() => { const n = new Date(); return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()); })();
  const todayVisits = visits.filter((v) => +new Date(v.created_at) >= todayStart).length;

  // Daily visits (last 14 days, UTC)
  const days: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const start = todayStart - i * 86400000;
    const end = start + 86400000;
    const count = visits.filter((v) => { const t = +new Date(v.created_at); return t >= start && t < end; }).length;
    days.push({ label: new Date(start).toLocaleDateString("en-US", { month: "numeric", day: "numeric", timeZone: "UTC" }), count });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  // Dimensions
  const topSources = topBy(visits, sourceOf);
  const topCampaigns = topBy(visits, (v) => v.utm_campaign);
  const topStates = topBy(visits, (v) => (v.region ? `${v.region}${v.country ? `, ${v.country}` : ""}` : null));
  const topCities = topBy(visits, (v) => (v.city ? `${v.city}${v.region ? `, ${v.region}` : ""}` : null));
  const topPages = topBy(visits, (v) => v.path);

  // Campaign attribution: distinct visitors whose session carried this utm_campaign.
  const campVisitors = (utm: string | null) => {
    if (!utm) return 0;
    const s = new Set<string>();
    for (const v of visits) if (v.utm_campaign === utm && v.session_id) s.add(v.session_id);
    return s.size;
  };
  const ledger = campaigns.map((c) => ({ ...c, _visitors: campVisitors(c.utm_campaign) }));

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Marketing &amp; Traffic</h1>
              <p className="mt-1 text-slate-300">Last 30 days · campaigns, sources &amp; geography.</p>
            </div>
            <Link href="/admin" className="btn-outline text-sm">← Admin</Link>
          </div>
        </div>
      </section>

      <div className="container-page space-y-8 py-8">
        {missing ? (
          <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-6 text-sm text-amber-800">
            <h2 className="font-heading text-lg font-bold text-navy">Marketing tables not created yet</h2>
            <p className="mt-1">Run <code>supabase/marketing-migration.sql</code> in Supabase, then refresh. Visit tracking starts immediately after.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Visits · 30 days" value={visits.length} />
              <StatCard label="Unique visitors · 30 days" value={sessions.size} />
              <StatCard label="Visits today" value={todayVisits} />
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-heading text-lg font-bold uppercase text-navy">Visits · last 14 days</h3>
              <div className="flex h-40 items-end gap-1.5">
                {days.map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-1 items-end">
                      <div className="w-full rounded-t bg-brand-sky" style={{ height: `${(d.count / maxDay) * 100}%` }} title={`${d.count} visits`} />
                    </div>
                    <span className="text-[10px] text-slate-400">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <RankTable title="Top sources" rows={topSources} empty="No traffic yet." />
              <RankTable title="Top campaigns (UTM)" rows={topCampaigns} empty="No campaign-tagged visits yet." />
              <RankTable title="Top states / regions" rows={topStates} empty="No geo data yet (populates on the live site)." />
              <RankTable title="Top cities" rows={topCities} empty="No geo data yet." />
            </div>

            <RankTable title="Top pages" rows={topPages} empty="No pageviews yet." />

            <section>
              <h2 className="section-title mb-1">Campaign spend ledger</h2>
              <p className="mb-4 text-sm text-slate-500">Log what you spend; visitors are attributed by <code>utm_campaign</code> over the last 30 days.</p>
              <MarketingLedger campaigns={ledger} missing={missing} />
            </section>
          </>
        )}
      </div>
    </>
  );
}
