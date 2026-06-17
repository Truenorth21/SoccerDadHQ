"use client";

import { useMemo, useRef, useState } from "react";
import { AD_RATES, estimateAdCost, type CpmRates } from "@/lib/ads";

// Recommended artwork per placement (shown so advertisers know what to produce).
const SPECS: Record<string, string> = {
  "home-banner": "Leaderboard — 728×90 (plus 320×50 for mobile)",
  directory: "Rectangle 300×250 (or leaderboard 728×90)",
  news: "Native image — ~1200×675",
  profile: "Rectangle — 300×250",
  rankings: "Leaderboard — 728×90",
  newsletter: "Email banner — 600px wide",
};

// Accepted base dimensions per placement (2× retina uploads pass via ratio + min-width).
const ACCEPTED: Record<string, { w: number; h: number }[]> = {
  "home-banner": [{ w: 728, h: 90 }, { w: 970, h: 250 }],
  directory: [{ w: 300, h: 250 }, { w: 728, h: 90 }],
  news: [{ w: 1200, h: 675 }],
  profile: [{ w: 300, h: 250 }],
  rankings: [{ w: 728, h: 90 }],
  newsletter: [{ w: 600, h: 0 }], // flexible height — just needs to be wide enough
};

function readImageSize(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image."));
    };
    img.src = url;
  });
}

function readSizeFromUrl(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = src;
  });
}

/** Returns an error string if the image doesn't fit the placement, else null.
 *  Matches by aspect ratio (±6%) + at least 90% of the base width, so exact and
 *  2×/3× retina assets both pass while wrong-shaped art is rejected. */
function checkDimensions(placementKey: string, w: number, h: number): string | null {
  const accepted = ACCEPTED[placementKey];
  if (!accepted) return null;
  if (placementKey === "newsletter") {
    return w >= 600 ? null : `Newsletter banner should be at least 600px wide (yours is ${w}px).`;
  }
  for (const a of accepted) {
    const ratio = a.w / a.h;
    if (Math.abs(w / h - ratio) / ratio <= 0.06 && w >= a.w * 0.9) return null;
  }
  const sizes = accepted.map((a) => `${a.w}×${a.h}`).join(" or ");
  return `That image is ${w}×${h}px. This placement needs ${sizes} (same shape — 2× retina is fine).`;
}

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
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const placement = AD_RATES.placements.find((p) => p.key === f.placement)!;
  const isNewsletter = placement.type === "newsletter";

  async function uploadFile(file: File) {
    setUploadErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ad-upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed.");
      setF((prev) => ({ ...prev, creative_url: d.url }));
    } catch (e: any) {
      setUploadErr(e.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

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
          <select
            className="input"
            value={f.placement}
            onChange={async (e) => {
              const key = e.target.value;
              setF((prev) => ({ ...prev, placement: key }));
              setUploadErr("");
              // Re-check already-attached artwork against the new placement's size.
              if (f.creative_url) {
                try {
                  const { w, h } = await readSizeFromUrl(f.creative_url);
                  const err = checkDimensions(key, w, h);
                  if (err) setUploadErr(`${err} Re-upload artwork for this placement.`);
                } catch {
                  /* ignore — admin review still catches it */
                }
              }
            }}
          >
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

        {/* Artwork upload + specs */}
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <label className="label">Banner artwork</label>
          <p className="-mt-0.5 mb-2 text-xs text-slate-500">
            Recommended size: <strong className="text-navy">{SPECS[f.placement] ?? "see specs"}</strong> · PNG, JPG, GIF or WEBP · ≤ 2 MB
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadErr("");
                try {
                  const { w, h } = await readImageSize(file);
                  const err = checkDimensions(f.placement, w, h);
                  if (err) {
                    setUploadErr(err);
                    if (fileRef.current) fileRef.current.value = "";
                    return;
                  }
                  await uploadFile(file);
                } catch (er: any) {
                  setUploadErr(er.message ?? "Couldn't read that image.");
                }
                if (fileRef.current) fileRef.current.value = "";
              }}
            />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline text-sm">
              {uploading ? "Uploading…" : f.creative_url ? "Replace artwork" : "Upload artwork"}
            </button>
            {f.creative_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={f.creative_url} alt="Banner preview" className="h-12 max-w-[180px] rounded border border-slate-200 object-contain" />
            )}
          </div>
          {uploadErr && <p className="mt-1 text-xs text-red-600">{uploadErr}</p>}
          <p className="mt-2 text-xs text-slate-400">
            No artwork yet? Leave it blank and email it to{" "}
            <a href="mailto:hello@soccerdadhq.com" className="font-semibold text-brand-blue hover:underline">hello@soccerdadhq.com</a>,
            or paste a hosted link:
          </p>
          <input
            className="input mt-1 text-sm"
            placeholder="https://link-to-your-artwork.png (optional)"
            value={f.creative_url}
            onChange={(e) => setF({ ...f, creative_url: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Click-through URL (where the ad sends people)</label>
          <input className="input" placeholder="https://your-site.com" value={f.landing_url} onChange={(e) => setF({ ...f, landing_url: e.target.value })} />
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
              Your ad runs only in the placement you select.
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
