"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { REGIONS } from "@/lib/regions";

const KINDS = [
  { value: "club", label: "Club" },
  { value: "school", label: "High School" },
  { value: "coach", label: "Coach" },
  { value: "training-center", label: "Training Center" },
  { value: "facility", label: "Facility" },
  { value: "tournament", label: "Tournament" },
  { value: "camp", label: "Camp" },
];

export default function SubmitForm() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [f, setF] = useState({ kind: "club", name: "", region: "", city: "", website: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email } : null);
      setAuthReady(true);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setStatus("done");
      setMessage(data.message);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return <div className="card border-l-4 border-emerald-400 p-6 text-emerald-800">✓ {message}</div>;
  }

  // Require a registered user when Supabase is configured.
  if (isSupabaseConfigured && authReady && !user) {
    return (
      <div className="card p-6 text-center">
        <h2 className="font-heading text-xl font-bold text-navy">Log in to submit a listing</h2>
        <p className="mt-1 text-sm text-slate-500">Submitting is open to registered members so we can keep the directory clean.</p>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary mt-4">Log in or sign up</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Type</label>
          <select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Name</label>
          <input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Sunshine Soccer Club" />
        </div>
        <div>
          <label className="label">Region</label>
          <select className="input" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })}>
            <option value="">Select…</option>
            {REGIONS.map((r) => (
              <option key={r.key} value={r.key}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Website (optional)</label>
        <input className="input" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} placeholder="https://" />
      </div>
      <div>
        <label className="label">Anything else?</label>
        <textarea className="input min-h-[90px]" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Leagues, age groups, contact — anything that helps us list it accurately." />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <button type="submit" disabled={status === "loading"} className="btn-primary">
        {status === "loading" ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-xs text-slate-400">We review every submission before it goes live. Basic listings are free; the program can later claim it to manage the profile.</p>
    </form>
  );
}
