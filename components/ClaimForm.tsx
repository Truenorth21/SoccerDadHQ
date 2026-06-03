"use client";

import { useEffect, useState } from "react";

interface Quote {
  label: string;
  tier: "claim" | "featured";
  claimPrice: number;
  featuredPrice: number;
  base: number;
  discount: number;
  final: number;
  promoOk: boolean;
  promoNote: string | null;
  referralOk: boolean;
  referralReward: number;
}

export default function ClaimForm({
  subjectType,
  subjectSlug,
  subjectName,
}: {
  subjectType: string;
  subjectSlug: string;
  subjectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<"claim" | "featured">("claim");
  const [form, setForm] = useState({ name: "", role: "Director", email: "", phone: "", message: "" });
  const [promo, setPromo] = useState("");
  const [referral, setReferral] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const payLink = process.env.NEXT_PUBLIC_PAYMENT_LINK;

  // Fetch the annual price (and any discount) when the form opens or codes change.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      fetch("/api/claim/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: subjectType, tier, promo, referral }),
      })
        .then((r) => r.json())
        .then(setQuote)
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [open, subjectType, tier, promo, referral]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_type: subjectType,
          subject_slug: subjectSlug,
          subject_name: subjectName,
          plan: tier,
          plan_price: quote?.final,
          promo_code: quote?.promoOk ? promo : "",
          referral_code: quote?.referralOk ? referral : "",
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your claim.");
      setStatus("done");
      setMessage(data.message);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="card border-l-4 border-emerald-400 p-5 text-left">
        <h3 className="font-heading text-lg font-bold text-navy">✓ Claim request received</h3>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
        {quote && (
          <p className="mt-3 text-sm text-slate-700">
            {tier === "featured" ? "Featured" : "Claim"} plan: <strong className="text-navy">${quote.final}/yr</strong>
            {quote.discount > 0 && <span className="text-slate-400"> (was ${quote.base})</span>}
          </p>
        )}
        {payLink ? (
          <a href={payLink} target="_blank" rel="noopener noreferrer" className="btn-amber mt-3">
            Pay ${quote?.final ?? ""} to activate →
          </a>
        ) : (
          <p className="mt-3 text-xs text-slate-500">We'll email you a secure payment link to activate your subscription.</p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-navy w-full text-sm">
        Claim this profile
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      {/* Tier picker — basic Claim vs premium Featured, both annual */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { key: "claim" as const, name: "Claim", price: quote?.claimPrice, blurb: "Manage your profile" },
          { key: "featured" as const, name: "Featured", price: quote?.featuredPrice, blurb: "★ Stand out + priority" },
        ]).map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTier(t.key)}
            className={`rounded-lg border p-3 text-left transition ${
              tier === t.key ? "border-brand-sky bg-sky-50 ring-1 ring-brand-sky" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-navy">{t.name}</span>
              <span className="text-sm font-bold text-brand-blue">{t.price != null ? `$${t.price}` : "—"}<span className="text-xs font-normal text-slate-400">/yr</span></span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">{t.blurb}</p>
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-navy p-3 text-white">
        <div className="flex items-end justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-300">
            {tier === "featured" ? "Featured" : "Claim"}{quote ? ` · ${quote.label}` : ""}
          </span>
          <span className="font-heading text-2xl font-bold text-brand-amber">
            ${quote?.final ?? "—"}
            <span className="text-sm text-slate-300">/yr</span>
          </span>
        </div>
        {quote && quote.discount > 0 && (
          <p className="mt-1 text-xs text-emerald-300">
            −${quote.discount} off ${quote.base}
            {quote.promoOk && quote.promoNote ? ` · ${quote.promoNote}` : ""}
            {quote.referralOk ? " · referral applied" : ""}
          </p>
        )}
        <p className="mt-1 text-[11px] text-slate-400">Basic listing is free. This is the paid plan to manage the profile.</p>
      </div>

      <p className="text-sm text-slate-500">
        Tell us who you are at <strong>{subjectName}</strong>. We verify claims before granting access.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option>Director</option>
          <option>Head Coach</option>
          <option>Administrator</option>
          <option>Owner</option>
          <option>Other staff</option>
        </select>
        <input required type="email" className="input" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Promo code (optional)" value={promo} onChange={(e) => setPromo(e.target.value)} />
        <input className="input" placeholder="Referral code (optional)" value={referral} onChange={(e) => setReferral(e.target.value)} />
      </div>
      {promo && quote && !quote.promoOk && <p className="text-xs text-amber-600">That promo code isn't valid.</p>}
      <textarea className="input min-h-[70px]" placeholder="Anything that helps us verify you (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === "loading"} className="btn-primary flex-1">
          {status === "loading" ? "Submitting…" : "Submit & continue to payment"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
