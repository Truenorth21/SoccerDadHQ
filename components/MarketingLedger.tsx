"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = Record<string, any> & { _visitors?: number };

export default function MarketingLedger({ campaigns, missing }: { campaigns: Campaign[]; missing?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", channel: "", utm_campaign: "", spend: "", start_date: "", end_date: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (missing) {
    return (
      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-amber-800">
        The marketing tables don&rsquo;t exist yet. Run <code>supabase/marketing-migration.sql</code> in Supabase,
        then refresh to start tracking traffic and campaigns.
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save.");
      setF({ name: "", channel: "", utm_campaign: "", spend: "", start_date: "", end_date: "", notes: "" });
      setStatus("idle");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this campaign?")) return;
    await fetch("/api/admin/marketing", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="block lg:col-span-2">
          <span className="label">Campaign name *</span>
          <input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="June Instagram boost" />
        </label>
        <label className="block">
          <span className="label">Channel</span>
          <input className="input" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} placeholder="Instagram" />
        </label>
        <label className="block">
          <span className="label">utm_campaign</span>
          <input className="input" value={f.utm_campaign} onChange={(e) => setF({ ...f, utm_campaign: e.target.value })} placeholder="june-ig" />
        </label>
        <label className="block">
          <span className="label">Spend ($)</span>
          <input type="number" min="0" step="0.01" className="input" value={f.spend} onChange={(e) => setF({ ...f, spend: e.target.value })} placeholder="50" />
        </label>
        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving" ? "Saving…" : "+ Add"}
        </button>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-4">
          <label className="block"><span className="label">Start</span><input type="date" className="input" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} /></label>
          <label className="block"><span className="label">End</span><input type="date" className="input" value={f.end_date} onChange={(e) => setF({ ...f, end_date: e.target.value })} /></label>
          <label className="block lg:col-span-2"><span className="label">Notes</span><input className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
        </div>
        {status === "error" && <p className="text-sm text-red-600 lg:col-span-6">{msg}</p>}
      </form>
      <p className="text-xs text-slate-400">
        Tag your campaign links so visits are attributed, e.g.{" "}
        <code className="rounded bg-slate-100 px-1">soccerdadhq.com/?utm_source=instagram&amp;utm_campaign=june-ig</code> — use the same
        <strong> utm_campaign</strong> value above.
      </p>

      {campaigns.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">No campaigns logged yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Campaign</th>
                <th className="px-4 py-2">Channel</th>
                <th className="px-4 py-2">utm_campaign</th>
                <th className="px-4 py-2 text-right">Spend</th>
                <th className="px-4 py-2 text-right">Visitors</th>
                <th className="px-4 py-2 text-right">Cost / visitor</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const visitors = c._visitors ?? 0;
                const cpv = visitors > 0 ? Number(c.spend) / visitors : 0;
                return (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-navy">{c.name}</td>
                    <td className="px-4 py-2 text-slate-500">{c.channel || "—"}</td>
                    <td className="px-4 py-2"><code className="rounded bg-slate-100 px-1 text-xs">{c.utm_campaign || "—"}</code></td>
                    <td className="px-4 py-2 text-right">${Number(c.spend).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-semibold text-navy">{visitors.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{visitors > 0 ? `$${cpv.toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => remove(c.id)} className="font-semibold text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
