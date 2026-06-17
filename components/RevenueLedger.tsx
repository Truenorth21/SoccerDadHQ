"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Entry = Record<string, any>;

const CATS = [
  { value: "partners", label: "🤝 Partner" },
  { value: "ads", label: "📣 Ad (offline)" },
  { value: "claims", label: "⭐ Profile claim (offline)" },
  { value: "other", label: "➕ Other" },
];
const catLabel = (c: string) => CATS.find((x) => x.value === c)?.label ?? c;
const today = () => new Date().toISOString().slice(0, 10);

export default function RevenueLedger({ entries, missing }: { entries: Entry[]; missing?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ category: "partners", amount: "", source: "", occurred_at: today(), note: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (missing) {
    return (
      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-amber-800">
        The <code>revenue_entries</code> table doesn&rsquo;t exist yet. Run the migration (provided separately) in
        Supabase, then refresh to start logging partner deals &amp; offline revenue here.
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save.");
      setF({ category: f.category, amount: "", source: "", occurred_at: today(), note: "" });
      setStatus("idle");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this revenue entry?")) return;
    await fetch("/api/admin/revenue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Add form */}
      <form onSubmit={save} className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="block">
          <span className="label">Category</span>
          <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {CATS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Amount ($)</span>
          <input required type="number" min="1" step="0.01" className="input" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="3000" />
        </label>
        <label className="block lg:col-span-2">
          <span className="label">Source / who</span>
          <input className="input" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder="Weston FC — Gold partnership" />
        </label>
        <label className="block">
          <span className="label">Date</span>
          <input type="date" className="input" value={f.occurred_at} onChange={(e) => setF({ ...f, occurred_at: e.target.value })} />
        </label>
        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving" ? "Saving…" : "+ Add"}
        </button>
        {status === "error" && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-6">{msg}</p>}
      </form>

      {/* List */}
      {entries.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
          No manual entries yet. Log partner deals and any revenue earned outside the site here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-500">{e.occurred_at}</td>
                  <td className="px-4 py-2">{catLabel(e.category)}</td>
                  <td className="px-4 py-2 text-navy">{e.source || <span className="text-slate-400">—</span>}{e.note ? <span className="text-slate-400"> · {e.note}</span> : ""}</td>
                  <td className="px-4 py-2 text-right font-semibold text-navy">${Number(e.amount).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => remove(e.id)} className="font-semibold text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
