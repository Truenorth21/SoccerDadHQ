"use client";

import { useState } from "react";
import { US_STATES } from "@/lib/states";

/** Region-targeted newsletter capture for profile pages. The hook is tryout
 *  alerts (the strongest reason a parent gives an email), pre-set to the
 *  profile's region. Posts to /api/newsletter like the main signup. */
export default function TryoutAlertSignup({
  region,
  regionName,
  state,
}: {
  region?: string;
  regionName: string;
  state?: string; // two-letter code; implied by the region when omitted
}) {
  const [email, setEmail] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  // Without a region or state to pre-set (e.g. the national tryouts page), ask for one.
  const askState = !region && !state;
  const [pickedState, setPickedState] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, region: region || null, state: state || pickedState, age_confirmed: ageConfirmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      setMessage(data.message || "You're in! Tryout alerts on the way.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="card border-l-4 border-emerald-400 p-4 text-sm text-emerald-800">✓ {message}</div>
    );
  }

  return (
    <form onSubmit={submit} className="card bg-navy p-5 text-white">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-amber-300">🔔 Tryout alerts · {regionName}</p>
      <p className="mt-1 text-sm text-slate-300">
        Get an email when {regionName} clubs post tryouts — plus the weekly Sideline. Free, one email a week, unsubscribe anytime.
      </p>
      {askState && (
        <select
          required
          value={pickedState}
          onChange={(e) => setPickedState(e.target.value)}
          className="mt-3 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-brand-sky focus:outline-none"
          aria-label="Your state"
        >
          <option value="" className="text-navy">Your state…</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code} className="text-navy">{s.name}</option>
          ))}
        </select>
      )}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
        />
        <button type="submit" disabled={status === "loading"} className="btn-amber shrink-0 text-sm">
          {status === "loading" ? "…" : "Get alerts"}
        </button>
      </div>
      <label className="mt-2 flex items-start gap-2 text-xs text-slate-400">
        <input type="checkbox" required checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5" />
        <span>I confirm I am at least 13 and agree to the <a href="/privacy" className="underline">Privacy Policy</a>.</span>
      </label>
      {status === "error" && <p className="mt-2 text-xs text-red-300">{message}</p>}
    </form>
  );
}
