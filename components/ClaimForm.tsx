"use client";

import { useEffect, useState } from "react";

interface Quote {
  label: string;
  base: number;
  discount: number;
  final: number;
  promoOk: boolean;
  promoNote: string | null;
  referralOk: boolean;
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
  const [form, setForm] = useState({ name: "", role: "Director", email: "", phone: "", message: "" });
  const [promo, setPromo] = useState("");
  const [referral, setReferral] = useState("");
  const [facilityOK, setFacilityOK] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const isFacility = subjectType === "facility";

  // Fetch the annual price (and any discount) when the form opens or codes change.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      fetch("/api/claim/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: subjectType, tier: "claim", promo, referral }),
      })
        .then((r) => r.json())
        .then(setQuote)
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [open, subjectType, promo, referral]);

  const isFree = quote != null && quote.final <= 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/claim/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_type: subjectType,
          subject_slug: subjectSlug,
          subject_name: subjectName,
          plan: "claim",
          promo_code: quote?.promoOk ? promo : "",
          referral_code: quote?.referralOk ? referral : "",
          facility_public: isFacility ? facilityOK : undefined,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start your claim.");
      if (data.url) {
        window.location.href = data.url; // paid → Stripe Checkout
        return;
      }
      setStatus("done"); // free/comped or manual fallback
      setMessage(data.message || "Your claim was received.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="card border-l-4 border-emerald-400 p-5 text-left">
        <h3 className="font-heading text-lg font-bold text-navy">✓ Claim received</h3>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
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
      {/* Price — one paid Claim plan (free for public facilities) */}
      <div className="rounded-lg bg-navy p-3 text-white">
        <div className="flex items-end justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-300">Claim{quote ? ` · ${quote.label}` : ""}</span>
          <span className="font-heading text-2xl font-bold text-brand-amber">
            {isFree ? "Free" : <>${quote?.final ?? "—"}<span className="text-sm text-slate-300">/yr</span></>}
          </span>
        </div>
        {quote && quote.discount > 0 && (
          <p className="mt-1 text-xs text-emerald-300">
            −${quote.discount} off ${quote.base}
            {quote.promoOk && quote.promoNote ? ` · ${quote.promoNote}` : ""}
            {quote.referralOk ? " · referral applied" : ""}
          </p>
        )}
        <p className="mt-1 text-[11px] text-slate-400">
          {isFacility
            ? "Public facilities are free to claim — just confirm it below."
            : "Being listed is free. This is the paid plan to manage the profile."}
        </p>
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
        {!isFree && <input className="input" placeholder="Promo code (optional)" value={promo} onChange={(e) => setPromo(e.target.value)} />}
        {!isFree && <input className="input" placeholder="Referral code (optional)" value={referral} onChange={(e) => setReferral(e.target.value)} />}
      </div>
      {promo && quote && !quote.promoOk && <p className="text-xs text-amber-600">That promo code isn't valid.</p>}

      {isFacility && (
        <label className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-sky" checked={facilityOK} onChange={(e) => setFacilityOK(e.target.checked)} />
          I confirm <strong className="mx-1">{subjectName}</strong> is a public city, county or state-operated facility.
        </label>
      )}

      <textarea className="input min-h-[70px]" placeholder="Anything that helps us verify you (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === "loading" || (isFacility && !facilityOK)} className="btn-primary flex-1">
          {status === "loading" ? "Submitting…" : isFree ? "Claim for free" : "Continue to payment"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
