"use client";

import { useRef, useState } from "react";
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

type AdFieldMode = "affiliate" | "sponsor" | "house";

function AdFields({ ad, mode, onChange }: { ad: Ad; mode: AdFieldMode; onChange: (a: Ad) => void }) {
  const set = (k: keyof Ad, v: string) => onChange({ ...ad, [k]: v });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const isAffiliate = mode === "affiliate";

  // Upload artwork to the ad-creatives bucket and drop the public URL into `image`.
  async function uploadImage(file: File) {
    setUploadErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ad-upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed.");
      onChange({ ...ad, image: d.url });
    } catch (e: any) {
      setUploadErr(e.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {isAffiliate && (
        <div>
          <label className="label">Affiliate network</label>
          <select
            className="input"
            value={ad.affiliateNetwork ?? "Amazon"}
            onChange={(e) => onChange({ ...ad, affiliate: true, affiliateNetwork: e.target.value as Ad["affiliateNetwork"] })}
          >
            <option value="Amazon">Amazon</option>
            <option value="ClickBank">ClickBank</option>
            <option value="Other">Other affiliate</option>
          </select>
        </div>
      )}
      <input
        className="input"
        placeholder={isAffiliate ? "Product source / brand" : "Advertiser"}
        value={ad.advertiser}
        onChange={(e) => set("advertiser", e.target.value)}
      />
      <input
        className={`input ${isAffiliate ? "sm:col-span-2" : ""}`}
        placeholder={isAffiliate ? "Product name" : "Headline"}
        value={ad.headline}
        onChange={(e) => set("headline", e.target.value)}
      />
      <input className="input sm:col-span-2" placeholder={isAffiliate ? "Short product note" : "Body"} value={ad.body} onChange={(e) => set("body", e.target.value)} />
      <input className="input" placeholder={isAffiliate ? "CTA (e.g. View on Amazon)" : "CTA (e.g. Learn more)"} value={ad.cta} onChange={(e) => set("cta", e.target.value)} />
      <input className="input" placeholder={isAffiliate ? "Amazon referral link or ClickBank hoplink" : "Link URL"} value={ad.href} onChange={(e) => set("href", e.target.value)} />
      <div className="sm:col-span-2">
        <label className="label">{isAffiliate ? "Product image - paste a URL or upload" : "Ad image (optional banner) - paste a URL or upload"}</label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input min-w-[200px] flex-1"
            placeholder="Image URL"
            value={ad.image ?? ""}
            onChange={(e) => set("image", e.target.value)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn-outline whitespace-nowrap text-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          {ad.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.image} alt="" className="h-9 w-14 shrink-0 rounded object-cover ring-1 ring-slate-200" />
          )}
        </div>
        {uploadErr && <p className="mt-1 text-xs text-red-600">{uploadErr}</p>}
      </div>
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
  const affiliateInventory = cfg.inventory.map((ad, index) => ({ ad, index })).filter(({ ad }) => ad.affiliate);
  const sponsorInventory = cfg.inventory.map((ad, index) => ({ ad, index })).filter(({ ad }) => !ad.affiliate);

  function setInv(i: number, ad: Ad) {
    const inventory = [...cfg.inventory];
    inventory[i] = ad;
    setCfg({ ...cfg, inventory });
    setStatus("idle");
  }
  function addAffiliate() {
    setCfg({
      ...cfg,
      inventory: [
        ...cfg.inventory,
        {
          id: `affiliate-${cfg.inventory.length + 1}`,
          advertiser: "Amazon",
          headline: "",
          body: "",
          cta: "View on Amazon",
          href: "",
          color: COLORS[6],
          affiliate: true,
          affiliateNetwork: "Amazon",
        },
      ],
    });
    setStatus("idle");
  }
  function addSponsor() {
    setCfg({
      ...cfg,
      inventory: [...cfg.inventory, { id: `sponsor-${cfg.inventory.length + 1}`, advertiser: "", headline: "", body: "", cta: "Learn more", href: "/advertise", color: COLORS[0] }],
    });
    setStatus("idle");
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
      {/* Affiliate products */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Affiliate products</h2>
          <button onClick={addAffiliate} className="btn-outline text-sm">+ Add affiliate product</button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Amazon products and ClickBank offers live here. These product image and referral link cards show before Google AdSense and paid sponsors.
        </p>
        <div className="space-y-3">
          {affiliateInventory.length ? affiliateInventory.map(({ ad, index }, itemIndex) => (
            <div key={ad.id || index} className="card p-4 ring-1 ring-amber-100">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase text-slate-500">Affiliate product {itemIndex + 1}</span>
                <button onClick={() => removeInv(index)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
              <AdFields ad={ad} mode="affiliate" onChange={(a) => setInv(index, { ...a, affiliate: true, affiliateNetwork: a.affiliateNetwork ?? "Amazon" })} />
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              No affiliate products yet. Add an Amazon product or ClickBank offer here.
            </div>
          )}
        </div>
      </section>

      {/* Sponsor inventory */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Sponsor inventory</h2>
          <button onClick={addSponsor} className="btn-outline text-sm">+ Add sponsor</button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Direct paid sponsors live here. These show after affiliate products and Google AdSense.
        </p>
        <div className="space-y-3">
          {sponsorInventory.length ? sponsorInventory.map(({ ad, index }, itemIndex) => (
            <div key={ad.id || index} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase text-slate-500">Sponsor {itemIndex + 1}</span>
                <button onClick={() => removeInv(index)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
              <AdFields ad={ad} mode="sponsor" onChange={(a) => setInv(index, { ...a, affiliate: false, affiliateNetwork: undefined })} />
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              No direct paid sponsors yet.
            </div>
          )}
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
              <AdFields ad={cfg.house[p.key]} mode="house" onChange={(a) => setHouse(p.key, a)} />
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
