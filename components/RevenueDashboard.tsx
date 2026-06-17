export interface RevenueBucket {
  ads: number;
  claims: number;
  partners: number;
  other: number;
  total: number;
}
export interface RevenueSummary {
  today: RevenueBucket;
  week: RevenueBucket;
  month: RevenueBucket;
  ytd: RevenueBucket;
  all: RevenueBucket;
}

const PERIODS: { key: keyof RevenueSummary; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "ytd", label: "Year to date" },
];

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function RevenueDashboard({ rev }: { rev: RevenueSummary }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="section-title">Revenue</h2>
        <p className="text-xs text-slate-400">All-time booked: <strong className="text-navy">{money(rev.all.total)}</strong></p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERIODS.map(({ key, label }) => {
          const p = rev[key];
          return (
            <div key={key} className="card p-5">
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 font-heading text-3xl font-bold text-navy">{money(p.total)}</p>
              <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">📣 Ads</span>
                  <span className="font-semibold text-navy">{money(p.ads)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">⭐ Profile claims</span>
                  <span className="font-semibold text-navy">{money(p.claims)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">🤝 Partners</span>
                  <span className="font-semibold text-navy">{money(p.partners)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">➕ Other / offline</span>
                  <span className="font-semibold text-navy">{money(p.other)}</span>
                </li>
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Auto-tracked: ad orders (invoiced/live) &amp; approved profile claims. Partners, offline deals and any other
        revenue are logged in the <strong className="text-slate-500">Revenue ledger</strong> below.
      </p>
    </section>
  );
}
