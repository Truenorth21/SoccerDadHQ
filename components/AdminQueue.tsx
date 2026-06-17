"use client";

import { useState } from "react";

type Row = Record<string, any>;

interface QueueDef {
  key: string;
  label: string;
  table: string;
  empty: string;
  title: (r: Row) => string;
  sub: (r: Row) => string;
  body?: (r: Row) => string | undefined;
  actions: { label: string; status?: string; action?: string; variant: "primary" | "amber" | "outline" }[];
}

const QUEUES: QueueDef[] = [
  {
    key: "claims",
    label: "Claims",
    table: "claim_requests",
    empty: "No pending profile claims.",
    title: (r) => `${r.subject_name || r.subject_slug} (${r.subject_type})`,
    sub: (r) =>
      `${r.claimant_name} · ${r.role ?? "—"} · ${r.email}` +
      ` · ${r.plan === "featured" ? "Featured" : "Claim"}` +
      (r.plan_price != null ? ` $${r.plan_price}/yr` : "") +
      (r.promo_code ? ` · promo ${r.promo_code}` : "") +
      (r.referral_code ? ` · ref ${r.referral_code}` : ""),
    body: (r) => r.message,
    actions: [
      { label: "Mark paid · Active", status: "active", variant: "amber" },
      { label: "Approve", status: "approved", variant: "primary" },
      { label: "Reject", status: "rejected", variant: "outline" },
    ],
  },
  {
    key: "submissions",
    label: "Submissions",
    table: "submissions",
    empty: "No new listing submissions.",
    title: (r) => `${r.name} (${r.kind})`,
    sub: (r) => `${r.city ?? ""}${r.region ? " · " + r.region : ""} · by ${r.submitter_email ?? "member"}`,
    body: (r) => {
      const d = r.details && typeof r.details === "object" ? r.details : {};
      const parts: string[] = [];
      const add = (label: string, v: any) => {
        if (v === undefined || v === null || v === "" || v === false) return;
        parts.push(`${label}: ${Array.isArray(v) ? v.join(", ") : v === true ? "yes" : v}`);
      };
      add("Address", d.address); add("ZIP", d.zip); add("Phone", d.phone); add("Email", d.email);
      add("Leagues", d.leagues); add("Teams", d.genders); add("Ages", d.age_groups);
      add("Type", d.type); add("Programs", d.programs); add("Class", d.fhsaa_class); add("District", d.district);
      add("Private training", d.private_training); add("Tags", d.tags);
      add("Focus", d.facet_focus); add("Format", d.facet_format);
      add("Surface", d.facet_surface); add("Level", d.facet_level); add("Kind", d.facet_type);
      return [r.website, ...parts, r.notes].filter(Boolean).join(" · ");
    },
    actions: [
      { label: "Approve & add to directory", status: "approved", variant: "primary" },
      { label: "Reject", status: "rejected", variant: "outline" },
    ],
  },
  {
    key: "commitments",
    label: "Commitments",
    table: "commitments",
    empty: "No commitments awaiting review.",
    title: (r) => `${r.player_name} → ${r.destination}`,
    sub: (r) => `${r.dest_type} · Class of ${r.grad_year} · ${r.subject_name ?? ""}`,
    actions: [
      { label: "Publish", status: "published", variant: "primary" },
      { label: "Reject", status: "rejected", variant: "outline" },
    ],
  },
  {
    key: "adOrders",
    label: "Ad Orders",
    table: "ad_orders",
    empty: "No pending ad orders.",
    title: (r) => `${r.business} — ${r.placement ?? "ad"}`,
    sub: (r) => `${r.contact} · ${r.email} · est. $${(r.estimate ?? 0).toLocaleString()}`,
    body: (r) => r.notes,
    actions: [
      { label: "Mark invoiced", status: "invoiced", variant: "amber" },
      { label: "Mark live", status: "live", variant: "primary" },
      { label: "Reject", status: "rejected", variant: "outline" },
    ],
  },
  {
    key: "partners",
    label: "Partners",
    table: "partner_inquiries",
    empty: "No new partner inquiries.",
    title: (r) => `${r.org} (${r.org_type ?? "—"})`,
    sub: (r) => `${r.tier ?? "—"} · ${r.contact} · ${r.email}`,
    body: (r) => r.goals,
    actions: [
      { label: "Contacted", status: "contacted", variant: "primary" },
      { label: "Won", status: "won", variant: "amber" },
      { label: "Lost", status: "lost", variant: "outline" },
    ],
  },
  {
    key: "reviews",
    label: "Reviews",
    table: "reviews",
    empty: "No recent reviews.",
    title: (r) => r.title,
    sub: (r) => `${r.subject_type} · ${r.author_name} · ${Number(r.overall_rating).toFixed(1)}★`,
    body: (r) => r.body,
    actions: [{ label: "Delete", action: "delete", variant: "outline" }],
  },
];

const BTN: Record<string, string> = { primary: "btn-primary", amber: "btn-amber", outline: "btn-outline" };

export default function AdminQueue({ data }: { data: Record<string, Row[]> }) {
  const [tab, setTab] = useState(QUEUES[0].key);
  const [rows, setRows] = useState<Record<string, Row[]>>(data);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ text: string; href?: string } | null>(null);

  const queue = QUEUES.find((q) => q.key === tab)!;
  const list = rows[tab] ?? [];

  async function act(q: QueueDef, row: Row, payload: { status?: string; action?: string }) {
    setBusy(row.id);
    setError("");
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: q.table, id: row.id, ...payload }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Action failed");
      // Remove handled row from the list.
      setRows((prev) => ({ ...prev, [q.key]: (prev[q.key] ?? []).filter((r) => r.id !== row.id) }));
      // When a submission becomes a live listing, point the admin to finish it.
      if (d.editHref) {
        setNotice({ text: `“${row.name}” was added to the directory. Finish its details:`, href: d.editHref });
      } else if (q.table === "submissions" && payload.status === "approved") {
        setNotice({ text: `“${row.name}” approved. (This type isn’t a directory listing yet, so nothing was published.)` });
      } else {
        setNotice(null);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {QUEUES.map((q) => (
          <button
            key={q.key}
            onClick={() => setTab(q.key)}
            className={`rounded-full px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
              tab === q.key ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            {q.label}
            <span className="ml-1.5 rounded-full bg-brand-sky px-1.5 text-xs font-bold text-white">
              {(rows[q.key] ?? []).length}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {notice && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          ✓ {notice.text}{" "}
          {notice.href && (
            <a href={notice.href} className="font-semibold underline">
              Open the manager →
            </a>
          )}
        </p>
      )}

      {list.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-100">{queue.empty}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((row) => (
            <li key={row.id} className="card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-heading text-lg font-bold text-navy">{queue.title(row)}</p>
                  <p className="text-sm text-slate-500">{queue.sub(row)}</p>
                  {queue.body?.(row) && <p className="mt-1 text-sm text-slate-600">{queue.body(row)}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {queue.actions.map((a) => (
                    <button
                      key={a.label}
                      disabled={busy === row.id}
                      onClick={() => act(queue, row, { status: a.status, action: a.action })}
                      className={`${BTN[a.variant]} text-sm`}
                    >
                      {busy === row.id ? "…" : a.label}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
