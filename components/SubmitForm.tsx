"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { REGIONS, FHSAA_CLASSES } from "@/lib/regions";

const KINDS = [
  { value: "club", label: "Club" },
  { value: "school", label: "High School" },
  { value: "coach", label: "Coach" },
  { value: "training-center", label: "Training Center" },
  { value: "facility", label: "Facility" },
  { value: "tournament", label: "Tournament" },
  { value: "camp", label: "Camp" },
];

const BLANK_DETAILS = {
  address: "",
  zip: "",
  phone: "",
  email: "",
  leagues: "",
  genders: [] as string[],
  age_groups: "",
  type: "",
  programs: [] as string[],
  fhsaa_class: "",
  district: "",
  private_training: false,
  tags: "",
};

// The two filter facets each listing directory uses — captured at submission so
// crowdsourced listings are filterable. Selected values become the listing's tags.
const LISTING_FACETS: Record<string, { label: string; key: string; options: string[] }[]> = {
  "training-center": [
    { label: "Focus", key: "facet_focus", options: ["Technical", "Goalkeeping", "Speed & Agility", "Finishing", "College Prep"] },
    { label: "Format", key: "facet_format", options: ["Private", "Small group", "Both"] },
  ],
  facility: [
    { label: "Surface", key: "facet_surface", options: ["Turf", "Grass", "Both", "Indoor"] },
    { label: "Type", key: "facet_type", options: ["Complex", "Single field", "Indoor arena"] },
  ],
  tournament: [
    { label: "Format", key: "facet_format", options: ["Showcase", "Cup", "League event"] },
    { label: "Level", key: "facet_level", options: ["Local", "Regional", "National", "College Showcase"] },
  ],
  camp: [
    { label: "Type", key: "facet_type", options: ["Day", "Residential", "ID camp", "Clinic"] },
    { label: "Focus", key: "facet_focus", options: ["Skills", "Goalkeeping", "College ID", "Position-specific"] },
  ],
};

export default function SubmitForm({ presetKind }: { presetKind?: string }) {
  const pathname = usePathname();
  const locked = KINDS.find((k) => k.value === presetKind);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [f, setF] = useState({ kind: locked?.value ?? "club", name: "", region: "", city: "", website: "", notes: "" });
  const [d, setD] = useState<Record<string, any>>({ ...BLANK_DETAILS });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email } : null);
      setAuthReady(true);
    });
  }, []);

  const setDetail = (k: string, v: any) => setD((prev) => ({ ...prev, [k]: v }));
  const toggleArr = (k: "genders" | "programs", val: string) =>
    setD((prev) => {
      const arr = (prev[k] as string[]) ?? [];
      const has = arr.includes(val);
      return { ...prev, [k]: has ? arr.filter((x) => x !== val) : [...arr, val] };
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, details: d }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setStatus("done");
      setMessage(data.message);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return <div className="card border-l-4 border-emerald-400 p-6 text-emerald-800">✓ {message}</div>;
  }

  // Require a registered user when Supabase is configured.
  if (isSupabaseConfigured && authReady && !user) {
    return (
      <div className="card p-6 text-center">
        <h2 className="font-heading text-xl font-bold text-navy">Log in to submit a listing</h2>
        <p className="mt-1 text-sm text-slate-500">Submitting is open to registered members so we can keep the directory clean.</p>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary mt-4">Log in or sign up</Link>
      </div>
    );
  }

  const kind = f.kind;
  const GenderBoxes = ({ field }: { field: "genders" | "programs" }) => (
    <div className="mt-1 flex gap-4 text-sm">
      {["Boys", "Girls"].map((g) => (
        <label key={g} className="flex items-center gap-1.5">
          <input type="checkbox" checked={d[field].includes(g)} onChange={() => toggleArr(field, g)} /> {g}
        </label>
      ))}
    </div>
  );

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Type</label>
          {locked ? (
            <div className="input flex items-center bg-slate-50 font-semibold text-navy">{locked.label}</div>
          ) : (
            <select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="label">Name</label>
          <input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Sunshine Soccer Club" />
        </div>
        <div>
          <label className="label">Region</label>
          <select required className="input" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })}>
            <option value="">Select…</option>
            {REGIONS.map((r) => (
              <option key={r.key} value={r.key}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">City</label>
          <input required className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
        </div>
      </div>

      {/* Details — optional; fill in what you know. Anything left blank, our team or
          the program can complete after it's reviewed. These power the directory filters. */}
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-slate-600">
          Details <span className="font-normal normal-case text-slate-400">— optional, fill in what you know</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Street address</label>
            <input className="input" value={d.address} onChange={(e) => setDetail("address", e.target.value)} placeholder="123 Main St" />
          </div>
          <div>
            <label className="label">ZIP code <span className="text-slate-400">(powers distance search)</span></label>
            <input className="input" value={d.zip} onChange={(e) => setDetail("zip", e.target.value)} placeholder="33178" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={d.phone} onChange={(e) => setDetail("phone", e.target.value)} placeholder="(305) 555-0100" />
          </div>
          <div>
            <label className="label">Contact email</label>
            <input className="input" value={d.email} onChange={(e) => setDetail("email", e.target.value)} placeholder="info@…" />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} placeholder="https://" />
          </div>

          {kind === "club" && (
            <>
              <div>
                <label className="label">Leagues</label>
                <input className="input" value={d.leagues} onChange={(e) => setDetail("leagues", e.target.value)} placeholder="ECNL, MLS NEXT, FSPL" />
              </div>
              <div>
                <label className="label">Age groups</label>
                <input className="input" value={d.age_groups} onChange={(e) => setDetail("age_groups", e.target.value)} placeholder="U8, U9, … U19" />
              </div>
              <div>
                <label className="label">Teams offered</label>
                <GenderBoxes field="genders" />
              </div>
            </>
          )}

          {kind === "school" && (
            <>
              <div>
                <label className="label">Public or Private</label>
                <select className="input" value={d.type} onChange={(e) => setDetail("type", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div>
                <label className="label">FHSAA class</label>
                <select className="input" value={d.fhsaa_class} onChange={(e) => setDetail("fhsaa_class", e.target.value)}>
                  <option value="">Select…</option>
                  {FHSAA_CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">District</label>
                <input className="input" value={d.district} onChange={(e) => setDetail("district", e.target.value)} placeholder="e.g. District 16" />
              </div>
              <div>
                <label className="label">Programs</label>
                <GenderBoxes field="programs" />
              </div>
            </>
          )}

          {kind === "coach" && (
            <>
              <div>
                <label className="label">Age groups coached</label>
                <input className="input" value={d.age_groups} onChange={(e) => setDetail("age_groups", e.target.value)} placeholder="U13, U14, U15" />
              </div>
              <div>
                <label className="label">Teams</label>
                <GenderBoxes field="genders" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={d.private_training} onChange={(e) => setDetail("private_training", e.target.checked)} />
                  Offers private training
                </label>
              </div>
            </>
          )}

          {LISTING_FACETS[kind]?.map((fct) => (
            <div key={fct.key}>
              <label className="label">{fct.label}</label>
              <select className="input" value={d[fct.key] ?? ""} onChange={(e) => setDetail(fct.key, e.target.value)}>
                <option value="">Select…</option>
                {fct.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
          {LISTING_FACETS[kind] && (
            <div className="sm:col-span-2">
              <label className="label">Other tags (optional)</label>
              <input className="input" value={d.tags} onChange={(e) => setDetail("tags", e.target.value)} placeholder="Comma-separated extras" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="label">Anything else?</label>
        <textarea className="input min-h-[80px]" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Coaching staff, history, anything that helps us list it accurately." />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <button type="submit" disabled={status === "loading"} className="btn-primary">
        {status === "loading" ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-xs text-slate-400">
        We review every submission before it goes live. Fill in what you know — our team or the program can complete the rest. Basic listings are free.
      </p>
    </form>
  );
}
