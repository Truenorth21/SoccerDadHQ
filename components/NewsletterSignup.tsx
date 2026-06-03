"use client";

import { useState } from "react";

export default function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
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
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("done");
      setMessage(data.message || "Welcome to The Sideline! ⚽");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className={compact ? "text-sm text-slate-300" : "rounded-lg bg-emerald-50 p-4 text-emerald-800"}>
        ✓ {message}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "space-y-2" : "flex flex-col gap-3 sm:flex-row"}>
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={compact ? "input bg-navy-700 border-navy-700 text-white placeholder:text-slate-400" : "input sm:max-w-xs"}
      />
      {!compact && (
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="input sm:max-w-[200px]"
          aria-label="Region (optional)"
        >
          <option value="">All of Florida</option>
          <option value="south-florida">South Florida</option>
          <option value="tampa-bay">Tampa Bay</option>
          <option value="orlando-central">Orlando / Central</option>
          <option value="jacksonville-ne">Jacksonville / NE</option>
        </select>
      )}
      <button type="submit" disabled={status === "loading"} className={compact ? "btn-amber w-full text-sm" : "btn-amber"}>
        {status === "loading" ? "Joining…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400">{message}</p>
      )}
    </form>
  );
}
