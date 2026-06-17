"use client";

import { useState } from "react";

/** Region-targeted newsletter capture for profile pages. The hook is tryout
 *  alerts (the strongest reason a parent gives an email), pre-set to the
 *  profile's region. Posts to /api/newsletter like the main signup. */
export default function TryoutAlertSignup({ region, regionName }: { region: string; regionName: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, region }),
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
      {status === "error" && <p className="mt-2 text-xs text-red-300">{message}</p>}
    </form>
  );
}
