"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Claim = Record<string, any>;

export default function ClaimsAdmin({ claims, missing }: { claims: Claim[]; missing?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");

  if (missing) {
    return (
      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-amber-800">
        Run <code>supabase/phase3-migration.sql</code> in Supabase to enable claimed-profile ownership &amp; expiry.
      </div>
    );
  }

  async function grant(id: string, addMonths: number) {
    setBusy(id);
    setErr("");
    const res = await fetch("/api/admin/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, addMonths }),
    });
    const d = await res.json();
    setBusy(null);
    if (!res.ok) return setErr(d.error || "Failed.");
    router.refresh();
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this claim? The owner loses access.")) return;
    await fetch("/api/admin/grant", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  const fmt = (d: string | null) => (d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—");
  const daysLeft = (d: string | null) => (d ? Math.ceil((+new Date(`${d}T00:00:00Z`) - Date.now()) / 86400000) : null);

  return (
    <div className="space-y-4">
      {err && <p className="text-sm text-red-600">{err}</p>}
      {claims.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">No claimed profiles yet. Approving a claim in the queue grants a 1-year claim here.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Profile</th>
                <th className="px-4 py-2">Owner</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Expires</th>
                <th className="px-4 py-2 text-right">Grant free months</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => {
                const dl = daysLeft(c.claimed_until);
                return (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-navy">{c.subject_name || c.subject_slug} <span className="text-xs text-slate-400">({c.subject_type})</span></td>
                    <td className="px-4 py-2 text-slate-500">{c.profiles?.email || "—"}</td>
                    <td className="px-4 py-2 text-slate-500">{c.plan === "featured" ? "Featured" : "Claim"}</td>
                    <td className="px-4 py-2">
                      {fmt(c.claimed_until)}{" "}
                      {dl !== null && <span className={`text-xs ${dl < 0 ? "text-red-600" : dl <= 30 ? "text-amber-600" : "text-slate-400"}`}>({dl < 0 ? "expired" : `${dl}d`})</span>}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1.5">
                        {[1, 3, 12].map((m) => (
                          <button key={m} disabled={busy === c.id} onClick={() => grant(c.id, m)} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-navy hover:bg-brand-sky/10">+{m}mo</button>
                        ))}
                        <button onClick={() => revoke(c.id)} className="ml-2 text-xs font-semibold text-red-600 hover:underline">Revoke</button>
                      </div>
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
