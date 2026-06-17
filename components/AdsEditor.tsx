"use client";

import { useState } from "react";
import type { Ad, AdsConfig, AdPlacement } from "@/lib/ads";
import { REGIONS } from "@/lib/regions";

const PLACEMENTS: { key: AdPlacement; label: string }[] = [
  { key: "home-banner", label: "Homepage banner" },
  { key: "directory-sidebar", label: "Directory" },
  { key: "news-infeed", label: "News feed" },
  { key: "profile-sidebar", label: "Profiles" },
  { key: "rankings-sidebar", label: "Rankings" },
  { key: "newsletter", label: "Newsletter" },
];

const COLORS = ["#1a4fa0", "#0a1628", "#2a7de1", "#1d7a4d", "#9b2d2d", "#5a2d82", "#e8a020", "#b8860b"];

function AdFields({ ad, onChange }: { ad: Ad; onChange: (a: Ad) => void }) {
  const set = (k: keyof Ad, v: string) => onChange({ ...ad, [k]: v });
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input className="input" placeholder="Advertiser" value={ad.advertiser} onChange={(e) => set("advertiser", e.target.value)} />
      <input className="input" placeholder="Headline" value={ad.headline} onChange={(e) => set("headline", e.target.value)} />
      <input className="input sm:col-span-2" placeholder="Body" value={ad.body} onChange={(e) => set("body", e.target.value)} />
      <input className="input" placeholder="CTA (e.g. Learn more)" value={ad.cta} onChange={(e) => set("cta", e.target.value)} />
      <input className="input" placeholder="Link URL" value={ad.href} onChange={(e) => set("href", e.target.value)} />
      <input className="input sm:col-span-2" placeholder="Image URL (optional banner)" value={ad.image ?? ""} onChange={(e) => set("image", e.target.value)} />
      <div>
        <label className="label">Placement (optional — blank = any slot)</label>
        <select className="input" value={ad.placement ?? ""} onChange={(e) => onChange({ ...ad, placement: (e.target.value || undefined) as AdPlacement | undefined })}>
          <option value="">Any slot</option>
          {PLACEMENTS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Newsletter region (optional — blank = all editions)</label>
        <select className="input" value={ad.region ?? ""} onChange={(e) => onChange({ ...ad, region: e.target.value || undefined })}>
          <option value="">All editions</option>
          <option value="statewide">Statewide edition only</option>
          {REGIONS.map((r) => (
            <option key={r.key} value={r.key}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Starts (optional)</label>
        <input type="date" className="input" value={(ad.starts ?? "").slice(0, 10)} onChange={(e) => set("starts", e.target.value)} />
      </div>
      <div>
        <label className="label">Ends (optional)</label>
        <input type="date" className="input" value={(ad.ends ?? "").slice(0, 10)} onChange={(e) => set("ends", e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
        <input type="checkbox" className="h-4 w-4 rounded accent-brand-sky" checked={!!ad.affiliate} onChange={(e) => onChange({ ...ad, affiliate: e.target.checked })} />
        Affiliate link (shows an &ldquo;Affiliate&rdquo; label)
      </label>
      <div className="flex items-center gap-2 sm:col-span-2">
        <span className="label mb-0">Color</span>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => set("color", c)}
            className={`h-6 w-6 rounded-full ring-2 ${ad.color === c ? "ring-navy" : "ring-transparent"}`}
            style={{ backgroundColor: c }}
            aria-label={c}
          />
        ))}
      </div>
    </div>
  );
}

export default function AdsEditor({ initial }: { initial: AdsConfig }) {
  const [cfg, setCfg] = useState<AdsConfig>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function setInv(i: number, ad: Ad) {
    const inventory = [...cfg.inventory];
    inventory[i] = ad;
    setCfg({ ...cfg, inventory });
    setStatus("idle");
  }
  function addInv() {
    setCfg({
      ...cfg,
      inventory: [...cfg.inventory, { id: `inv-${cfg.inventory.length + 1}`, advertiser: "", headline: "", body: "", cta: "Learn more", href: "/advertise", color: COLORS[0] }],
    });
  }
  function removeInv(i: number) {
    setCfg({ ...cfg, inventory: cfg.inventory.filter((_, idx) => idx !== i) });
  }
  function setHouse(p: AdPlacement, ad: Ad) {
    setCfg({ ...cfg, house: { ...cfg.house, [p]: ad } });
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "ads", value: cfg }),
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
      {/* Sponsor inventory */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Sponsor inventory</h2>
          <button onClick={addInv} className="btn-outline text-sm">+ Add sponsor</button>
        </div>
        <p className="mb-4 text-sm text-slate-500">Paid ads shown across slots. ~70% of impressions show these; the rest show the house ad for that slot.</p>
        <div className="space-y-3">
          {cfg.inventory.map((ad, i) => (
            <div key={i} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase text-slate-500">Sponsor {i + 1}</span>
                <button onClick={() => removeInv(i)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
              <AdFields ad={ad} onChange={(a) => setInv(i, a)} />
            </div>
          ))}
        </div>
      </section>

      {/* House ads */}
      <section>
        <h2 className="section-title mb-1">House ads</h2>
        <p className="mb-4 text-sm text-slate-500">Your own “advertise with us” promos, shown per slot when no sponsor is sold.</p>
        <div className="space-y-3">
          {PLACEMENTS.map((p) => (
            <div key={p.key} className="card p-4">
              <span className="mb-2 block font-heading text-sm font-bold uppercase text-slate-500">{p.label}</span>
              <AdFields ad={cfg.house[p.key]} onChange={(a) => setHouse(p.key, a)} />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-xl bg-navy p-4 text-white shadow-card-hover">
        <button onClick={save} disabled={status === "saving"} className="btn-amber">
          {status === "saving" ? "Saving…" : "Save ads"}
        </button>
        {status === "saved" && <span className="text-sm text-emerald-300">✓ {message}</span>}
        {status === "error" && <span className="text-sm text-red-300">{message}</span>}
        <span className="ml-auto text-xs text-slate-400">Live across all ad slots on save.</span>
      </div>
    </div>
  );
}
