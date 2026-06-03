"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegionOpt {
  key: string;
  name: string;
}

type ClubRow = Record<string, any>;

const BLANK: ClubRow = {
  id: "",
  slug: "",
  name: "",
  region: "",
  city: "",
  zip: "",
  website: "",
  description: "",
  logo_color: "#1a4fa0",
  leagues: "",
  age_groups: "",
  genders: [],
  lat: "",
  lng: "",
  tryouts_open: false,
  tryout_note: "",
  featured: false,
};

export default function ClubManager({ clubs, regions }: { clubs: ClubRow[]; regions: RegionOpt[] }) {
  const router = useRouter();
  const [form, setForm] = useState<ClubRow | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [msg, setMsg] = useState("");

  function edit(c: ClubRow) {
    setForm({
      ...c,
      leagues: Array.isArray(c.leagues) ? c.leagues.join(", ") : c.leagues ?? "",
      age_groups: Array.isArray(c.age_groups) ? c.age_groups.join(", ") : c.age_groups ?? "",
      genders: Array.isArray(c.genders) ? c.genders : [],
      zip: c.zip ?? "",
      website: c.website ?? "",
      description: c.description ?? "",
      lat: c.lat ?? "",
      lng: c.lng ?? "",
      tryout_note: c.tryout_note ?? "",
    });
    setStatus("idle");
    setMsg("");
  }

  function addNew() {
    setForm({ ...BLANK });
    setStatus("idle");
    setMsg("");
  }

  const set = (k: string, v: any) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const toggleGender = (g: string) =>
    setForm((f) => {
      if (!f) return f;
      const has = (f.genders as string[]).includes(g);
      return { ...f, genders: has ? (f.genders as string[]).filter((x) => x !== g) : [...(f.genders as string[]), g] };
    });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      setForm(null);
      setStatus("idle");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message);
    }
  }

  async function remove(c: ClubRow) {
    if (!confirm(`Delete "${c.name}"? This removes the real club from the directory.`)) return;
    await fetch("/api/admin/clubs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {clubs.length} real club{clubs.length === 1 ? "" : "s"} in the database (these override seeded data and show live).
        </p>
        <button onClick={addNew} className="btn-primary text-sm">+ Add club</button>
      </div>

      {/* Editor */}
      {form && (
        <form onSubmit={save} className="card space-y-4 p-5">
          <h3 className="font-heading text-lg font-bold uppercase text-navy">{form.id ? "Edit club" : "New club"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">Name *</span>
              <input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Doral Soccer Club" />
            </label>
            <label className="block">
              <span className="label">Slug {form.id ? "(locked)" : "(auto from name)"}</span>
              <input className="input" value={form.slug} disabled={!!form.id} onChange={(e) => set("slug", e.target.value)} placeholder="doral-soccer-club" />
            </label>
            <label className="block">
              <span className="label">Region *</span>
              <select required className="input" value={form.region} onChange={(e) => set("region", e.target.value)}>
                <option value="">Select region…</option>
                {regions.map((r) => (
                  <option key={r.key} value={r.key}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">City *</span>
              <input required className="input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Doral" />
            </label>
            <label className="block">
              <span className="label">ZIP</span>
              <input className="input" value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="33178" />
            </label>
            <label className="block">
              <span className="label">Website</span>
              <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">Description</span>
              <textarea className="input min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </label>
            <label className="block">
              <span className="label">Leagues (comma-separated)</span>
              <input className="input" value={form.leagues} onChange={(e) => set("leagues", e.target.value)} placeholder="ECNL, MLS NEXT" />
            </label>
            <label className="block">
              <span className="label">Age groups (comma-separated)</span>
              <input className="input" value={form.age_groups} onChange={(e) => set("age_groups", e.target.value)} placeholder="U8, U9, …, U19" />
            </label>
            <div className="block">
              <span className="label">Genders</span>
              <div className="mt-1 flex gap-4 text-sm">
                {["Boys", "Girls"].map((g) => (
                  <label key={g} className="flex items-center gap-1.5">
                    <input type="checkbox" checked={(form.genders as string[]).includes(g)} onChange={() => toggleGender(g)} />
                    {g}
                  </label>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="label">Crest color</span>
              <input type="color" className="input h-10 w-20 p-1" value={form.logo_color} onChange={(e) => set("logo_color", e.target.value)} />
            </label>
            <label className="block">
              <span className="label">Latitude (optional)</span>
              <input className="input" value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="25.81" />
            </label>
            <label className="block">
              <span className="label">Longitude (optional)</span>
              <input className="input" value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="-80.35" />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">Tryout note</span>
              <input className="input" value={form.tryout_note} onChange={(e) => set("tryout_note", e.target.value)} placeholder="Open tryouts Aug 5–7…" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!form.tryouts_open} onChange={(e) => set("tryouts_open", e.target.checked)} /> Tryouts open</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!form.verified} onChange={(e) => set("verified", e.target.checked)} /> Verified ✓</label>
          </div>
          {status === "error" && <p className="text-sm text-red-600">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={status === "saving"} className="btn-primary">
              {status === "saving" ? "Saving…" : "Save club"}
            </button>
            <button type="button" onClick={() => setForm(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {/* List */}
      {clubs.length > 0 && (
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Club</th>
                <th className="px-4 py-2">Region</th>
                <th className="px-4 py-2">City</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-navy">{c.name} {c.featured && <span className="text-brand-amber">★</span>}</td>
                  <td className="px-4 py-2 text-slate-500">{regions.find((r) => r.key === c.region)?.name ?? c.region}</td>
                  <td className="px-4 py-2 text-slate-500">{c.city}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => edit(c)} className="font-semibold text-brand-blue hover:underline">Edit</button>
                    <button onClick={() => remove(c)} className="ml-3 font-semibold text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
