"use client";

import { useMemo, useState } from "react";
import { AD_RATES, estimateAdCost, type CpmRates } from "@/lib/ads";

export default function AdOrderForm({ rates }: { rates: CpmRates }) {
  const [f, setF] = useState({
    business: "",
    contact: "",
    email: "",
    phone: "",
    website: "",
    placement: AD_RATES.placements[0].key as string,
    impressions: String(AD_RATES.impressionBlocks[0]),
    geo: "national" as "national" | "multi" | "few",
    issues: "4",
    start: "",
    weeks: "4",
    creative_url: "",
    landing_url: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const placement = AD_RATES.placements.find((p) => p.key === f.placement)!;
  const isNewsletter = placement.type === "newsletter";

  const estimate = useMemo(
    () =>
      estimateAdCost(
        {
          placementType: placement.type,
          impressions: parseInt(f.impressions, 10) || 0,
          geo: f.geo,
          issues: parseInt(f.issues, 10) || 0,
        },
        rates
      ),
    [placement.type, f.impressions, f.geo, f.issues, rates]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/ad-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, placement_label: placement.label, estimate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your order.");
      setStatus("done");
      setMessage(data.message || "Order received — we'll send an invoice to confirm.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    const payLink = process.env.NEXT_PUBLIC_PAYMENT_LINK;
    return (
      <div className="card border-l-4 border-emerald-400 p-6">
        <h3 className="font-heading text-xl font-bold text-navy">✓ Order submitted</h3>
        <p className="mt-1 text-sm text-emerald-800">{message}</p>
        <p className="mt-3 text-sm text-slate-500">
          Estimated total: <strong className="text-navy">${estimate.toLocaleString()}</strong>. This is a
          pre-paid order — your campaign goes live once payment clears and creative is approved.
        </p>
        {payLink && (
          <a href={payLink} target="_blank" rel="noopener noreferrer" className="btn-amber mt-4">
            Pay now →
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Order fields */}
      <div className="card space-y-4 p-6">
        <h3 className="font-heading text-xl font-bold uppercase text-navy">Campaign details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Business / advertiser</label>
            <input required className="input" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} />
          </div>
          <div>
            <label className="label">Contact name</label>
            <input required className="input" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input required type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Placement</label>
          <select className="input" value={f.placement} onChange={(e) => setF({ ...f, placement: e.target.value })}>
            {AD_RATES.placements.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        {isNewsletter ? (
          <div>
            <label className="label">Number of issues</label>
            <select className="input" value={f.issues} onChange={(e) => setF({ ...f, issues: e.target.value })}>
              {[1, 2, 4, 8, 12].map((n) => (
                <option key={n} value={n}>{n} issue{n === 1 ? "" : "s"}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Impressions</label>
              <select className="input" value={f.impressions} onChange={(e) => setF({ ...f, impressions: e.target.value })}>
                {AD_RATES.impressionBlocks.map((n) => (
                  <option key={n} value={n}>{n.toLocaleString()} impressions</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Geo-targeting</label>
              <select className="input" value={f.geo} onChange={(e) => setF({ ...f, geo: e.target.value as "national" | "multi" | "few" })}>
                {AD_RATES.geo.map((g) => (
                  <option key={g.key} value={g.key}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Preferred start date</label>
            <input type="date" className="input" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
          </div>
          {!isNewsletter && (
            <div>
              <label className="label">Flight length (weeks)</label>
              <input type="number" min={1} className="input" value={f.weeks} onChange={(e) => setF({ ...f, weeks: e.target.value })} />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Creative URL (image / file link)</label>
            <input className="input" placeholder="Link to your banner artwork" value={f.creative_url} onChange={(e) => setF({ ...f, creative_url: e.target.value })} />
          </div>
          <div>
            <label className="label">Click-through URL</label>
            <input className="input" placeholder="https://" value={f.landing_url} onChange={(e) => setF({ ...f, landing_url: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[80px]" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Targeting requests, timing, questions…" />
        </div>

        {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      </div>

      {/* Estimate / submit */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="card overflow-hidden">
          <div className="bg-navy p-5 text-white">
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-300">Estimated total</p>
            <p className="font-heading text-4xl font-bold text-brand-amber">${estimate.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-300">
              {isNewsletter
                ? `${f.issues} issue(s) × $${rates.newsletterPerIssue}`
                : `${parseInt(f.impressions, 10).toLocaleString()} impressions · ${AD_RATES.geo.find((g) => g.key === f.geo)?.label}`}
            </p>
          </div>
          <div className="space-y-3 p-5">
            <p className="text-xs text-slate-500">
              Banner CPM: ${rates.cpmStandard.national}–${rates.cpmStandard.few} per 1,000 (20k–80k),
              dropping to ${rates.cpmVolume.national}–${rates.cpmVolume.few} at {AD_RATES.volumeThreshold.toLocaleString()}+.
              Sizes: leaderboard 728×90, rectangle 300×250.
            </p>
            <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
              {status === "loading" ? "Submitting…" : "Submit pre-paid order"}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              No charge now. We'll email an invoice; your campaign goes live once it's paid and creative is approved.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
