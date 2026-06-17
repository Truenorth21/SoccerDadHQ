"use client";

import { useState } from "react";
import type { PricingConfig } from "@/lib/pricing";

export default function PricingEditor({ initial }: { initial: PricingConfig }) {
  const [cfg, setCfg] = useState<PricingConfig>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(next: Partial<PricingConfig>) {
    setCfg((c) => ({ ...c, ...next }));
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "pricing", value: cfg }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed");
      setStatus("saved");
      setMessage(d.message || "Saved.");
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message);
    }
  }

  return (
    <div className="space-y-10">
      {/* Partner tiers */}
      <section>
        <h2 className="section-title mb-3">Premier Partner tiers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {cfg.partnerTiers.map((t, i) => (
            <div key={i} className="card space-y-2 p-4">
              <input className="input font-heading text-lg font-bold" value={t.name} onChange={(e) => { const x=[...cfg.partnerTiers]; x[i]={...t,name:e.target.value}; update({partnerTiers:x}); }} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" value={t.price} onChange={(e) => { const x=[...cfg.partnerTiers]; x[i]={...t,price:e.target.value}; update({partnerTiers:x}); }} placeholder="$3,000" />
                <input className="input" value={t.cadence} onChange={(e) => { const x=[...cfg.partnerTiers]; x[i]={...t,cadence:e.target.value}; update({partnerTiers:x}); }} placeholder="/year" />
              </div>
              <label className="label">Features (one per line)</label>
              <textarea className="input min-h-[160px] text-sm" value={t.features.join("\n")} onChange={(e) => { const x=[...cfg.partnerTiers]; x[i]={...t,features:e.target.value.split("\n").filter((l)=>l.trim())}; update({partnerTiers:x}); }} />
            </div>
          ))}
        </div>
      </section>

      {/* Ad packages */}
      <section>
        <h2 className="section-title mb-3">Ad package prices</h2>
        <div className="space-y-2">
          {cfg.adPackages.map((p, i) => (
            <div key={i} className="card grid gap-2 p-3 sm:grid-cols-[1fr_2fr_140px]">
              <input className="input" value={p.name} onChange={(e) => { const x=[...cfg.adPackages]; x[i]={...p,name:e.target.value}; update({adPackages:x}); }} />
              <input className="input" value={p.desc} onChange={(e) => { const x=[...cfg.adPackages]; x[i]={...p,desc:e.target.value}; update({adPackages:x}); }} />
              <input className="input" value={p.price} onChange={(e) => { const x=[...cfg.adPackages]; x[i]={...p,price:e.target.value}; update({adPackages:x}); }} placeholder="from $250/mo" />
            </div>
          ))}
        </div>
      </section>

      {/* Ad rates (CPM) */}
      <section>
        <h2 className="section-title mb-3">Banner CPM rates ($ per 1,000 impressions)</h2>
        <div className="card grid gap-4 p-4 sm:grid-cols-2">
          {(["cpmStandard", "cpmVolume"] as const).map((band) => (
            <div key={band}>
              <h3 className="label">{band === "cpmStandard" ? "Standard (20k–80k)" : "Volume (100k+)"}</h3>
              <div className="grid grid-cols-3 gap-2">
                {(["national", "multi", "few"] as const).map((g) => (
                  <div key={g}>
                    <label className="text-xs text-slate-500">{g}</label>
                    <input
                      type="number"
                      className="input"
                      value={cfg.adRates[band][g]}
                      onChange={(e) =>
                        update({ adRates: { ...cfg.adRates, [band]: { ...cfg.adRates[band], [g]: Number(e.target.value) } } })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="label">Newsletter — per issue ($)</label>
            <input
              type="number"
              className="input max-w-[160px]"
              value={cfg.adRates.newsletterPerIssue}
              onChange={(e) => update({ adRates: { ...cfg.adRates, newsletterPerIssue: Number(e.target.value) } })}
            />
          </div>
        </div>
      </section>

      {/* Annual claim plans (per entity type) */}
      <section>
        <h2 className="section-title mb-1">Annual plans (per type)</h2>
        <p className="mb-3 text-sm text-slate-500">
          Basic listings stay free. Set the yearly price for each tier per type — these drive the claim form,
          the live quote and the <code>/advertise</code> pricing table everywhere.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-2 gap-2 bg-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
            <span>Category</span>
            <span>Claim / yr ($0 = free)</span>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(cfg.claimPlans).map(([key, plan]) => (
              <div key={key} className="grid grid-cols-2 items-center gap-2 px-4 py-2.5 even:bg-slate-50">
                <span className="font-heading text-sm font-bold text-navy">{plan.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-28"
                    value={plan.claim}
                    onChange={(e) => { const v = Number(e.target.value); update({ claimPlans: { ...cfg.claimPlans, [key]: { ...plan, claim: v, featured: v } } }); }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">Set a category to $0 to make it free to claim (e.g. public facilities).</p>
        </div>

        {/* Flat-fee promo */}
        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <label className="flex items-center gap-2 font-heading text-sm font-bold text-navy">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-sky"
              checked={!!cfg.flatPromo?.enabled}
              onChange={(e) => update({ flatPromo: { price: 99, exceptTypes: ["coach"], ...cfg.flatPromo, enabled: e.target.checked } })}
            />
            Flat-fee promo — one price for all paid types
          </label>
          <p className="mt-1 text-xs text-slate-500">
            While on, every paid type is charged this flat price, except the types you exclude (and free $0 types stay free).
            Use it for a limited-time launch offer.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="label">Flat price ($/yr)</span>
              <input
                type="number"
                step="0.01"
                className="input"
                value={cfg.flatPromo?.price ?? 99}
                onChange={(e) => update({ flatPromo: { enabled: false, exceptTypes: ["coach"], ...cfg.flatPromo, price: Number(e.target.value) } })}
              />
            </label>
            <label className="block text-sm">
              <span className="label">Excluded types (comma-separated)</span>
              <input
                className="input"
                value={(cfg.flatPromo?.exceptTypes ?? ["coach"]).join(", ")}
                onChange={(e) => update({ flatPromo: { enabled: false, price: 99, ...cfg.flatPromo, exceptTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                placeholder="coach"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Promo codes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Promo codes</h2>
          <button
            onClick={() => update({ promos: [...cfg.promos, { code: "NEWCODE", kind: "percent", value: 10, note: "", active: true }] })}
            className="btn-outline text-sm"
          >
            + Add code
          </button>
        </div>
        <div className="space-y-2">
          {cfg.promos.map((p, i) => (
            <div key={i} className="card grid items-center gap-2 p-3 sm:grid-cols-[1fr_120px_90px_1fr_auto]">
              <input className="input" value={p.code} onChange={(e) => { const x = [...cfg.promos]; x[i] = { ...p, code: e.target.value.toUpperCase() }; update({ promos: x }); }} />
              <select className="input" value={p.kind} onChange={(e) => { const x = [...cfg.promos]; x[i] = { ...p, kind: e.target.value as "percent" | "amount" }; update({ promos: x }); }}>
                <option value="percent">% off</option>
                <option value="amount">$ off</option>
              </select>
              <input type="number" className="input" value={p.value} onChange={(e) => { const x = [...cfg.promos]; x[i] = { ...p, value: Number(e.target.value) }; update({ promos: x }); }} />
              <input className="input" placeholder="Note" value={p.note ?? ""} onChange={(e) => { const x = [...cfg.promos]; x[i] = { ...p, note: e.target.value }; update({ promos: x }); }} />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  <input type="checkbox" className="h-4 w-4 accent-brand-sky" checked={p.active} onChange={(e) => { const x = [...cfg.promos]; x[i] = { ...p, active: e.target.checked }; update({ promos: x }); }} />
                  Active
                </label>
                <button onClick={() => update({ promos: cfg.promos.filter((_, idx) => idx !== i) })} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referral program */}
      <section>
        <h2 className="section-title mb-3">Referral program</h2>
        <div className="card grid gap-4 p-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-navy sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-brand-sky" checked={cfg.referral.enabled} onChange={(e) => update({ referral: { ...cfg.referral, enabled: e.target.checked } })} />
            Referral program enabled
          </label>
          <div>
            <label className="label">New-claimer discount ($)</label>
            <input type="number" className="input" value={cfg.referral.refereeDiscount} onChange={(e) => update({ referral: { ...cfg.referral, refereeDiscount: Number(e.target.value) } })} />
          </div>
          <div>
            <label className="label">Referrer reward ($ credit)</label>
            <input type="number" className="input" value={cfg.referral.referrerReward} onChange={(e) => update({ referral: { ...cfg.referral, referrerReward: Number(e.target.value) } })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Blurb</label>
            <input className="input" value={cfg.referral.blurb} onChange={(e) => update({ referral: { ...cfg.referral, blurb: e.target.value } })} />
          </div>
        </div>
      </section>

      {/* Save bar */}
      <div className="sticky bottom-4 flex items-center gap-3 rounded-xl bg-navy p-4 text-white shadow-card-hover">
        <button onClick={save} disabled={status === "saving"} className="btn-amber">
          {status === "saving" ? "Saving…" : "Save pricing"}
        </button>
        {status === "saved" && <span className="text-sm text-emerald-300">✓ {message}</span>}
        {status === "error" && <span className="text-sm text-red-300">{message}</span>}
        <span className="ml-auto text-xs text-slate-400">Changes go live on /advertise, /partners and the order form.</span>
      </div>
    </div>
  );
}
