"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegionOpt {
  key: string;
  name: string;
}

type Row = Record<string, any>;

const KINDS = [
  { value: "training-center", label: "Training Center" },
  { value: "facility", label: "Facility" },
  { value: "tournament", label: "Tournament" },
  { value: "camp", label: "Camp" },
];

const BLANK: Row = {
  id: "",
  slug: "",
  kind: "training-center",
  name: "",
  region: "",
  city: "",
  zip: "",
  website: "",
  email: "",
  phone: "",
  description: "",
  color: "#1a4fa0",
  tags: "",
  lat: "",
  lng: "",
  featured: false,
  verified: false,
};

export default function ListingManager({ listings, regions }: { listings: Row[]; regions: RegionOpt[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Row | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [msg, setMsg] = useState("");
  const kindLabel = (k: string) => KINDS.find((x) => x.value === k)?.label ?? k;

  function edit(l: Row) {
    setForm({
      ...l,
      tags: Array.isArray(l.tags) ? l.tags.join(", ") : l.tags ?? "",
      zip: l.zip ?? "",
      website: l.website ?? "",
      email: l.email ?? "",
      phone: l.phone ?? "",
      description: l.description ?? "",
      color: l.color ?? "#1a4fa0",
      lat: l.lat ?? "",
      lng: l.lng ?? "",
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/listings", {
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

  async function remove(l: Row) {
    if (!confirm(`Delete "${l.name}"? This removes the real listing from the directory.`)) return;
    await fetch("/api/admin/listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {listings.length} real listing{listings.length === 1 ? "" : "s"} in the database (training centers, facilities, tournaments, camps).
        </p>
        <button onClick={addNew} className="btn-primary text-sm">+ Add listing</button>
      </div>

      {form && (
        <form onSubmit={save} className="card space-y-4 p-5">
          <h3 className="font-heading text-lg font-bold uppercase text-navy">{form.id ? "Edit listing" : "New listing"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">Type *</span>
              <select required className="input" value={form.kind} disabled={!!form.id} onChange={(e) => set("kind", e.target.value)}>
                {KINDS.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Name *</span>
              <input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Elite Skills Academy" />
            </label>
            <label className="block">
              <span className="label">Slug {form.id ? "(locked)" : "(auto from name)"}</span>
              <input className="input" value={form.slug} disabled={!!form.id} onChange={(e) => set("slug", e.target.value)} />
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
              <input required className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </label>
            <label className="block">
              <span className="label">ZIP</span>
              <input className="input" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
            </label>
            <label className="block">
              <span className="label">Website</span>
              <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
            </label>
            <label className="block">
              <span className="label">Email</span>
              <input className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </label>
            <label className="block">
              <span className="label">Phone</span>
              <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">Description</span>
              <textarea className="input min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">Tags / facets (comma-separated)</span>
              <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Technical, Small group" />
            </label>
            <label className="block">
              <span className="label">Accent color</span>
              <input type="color" className="input h-10 w-20 p-1" value={form.color} onChange={(e) => set("color", e.target.value)} />
            </label>
            <label className="block">
              <span className="label">Latitude (optional)</span>
              <input className="input" value={form.lat} onChange={(e) => set("lat", e.target.value)} />
            </label>
            <label className="block">
              <span className="label">Longitude (optional)</span>
              <input className="input" value={form.lng} onChange={(e) => set("lng", e.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} /> Spotlight (featured)</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!form.verified} onChange={(e) => set("verified", e.target.checked)} /> Verified ✓</label>
          </div>
          {status === "error" && <p className="text-sm text-red-600">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={status === "saving"} className="btn-primary">
              {status === "saving" ? "Saving…" : "Save listing"}
            </button>
            <button type="button" onClick={() => setForm(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {listings.length > 0 && (
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Listing</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Region</th>
                <th className="px-4 py-2">City</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-navy">{l.name} {l.featured && <span className="text-brand-amber">★</span>}</td>
                  <td className="px-4 py-2 text-slate-500">{kindLabel(l.kind)}</td>
                  <td className="px-4 py-2 text-slate-500">{regions.find((r) => r.key === l.region)?.name ?? l.region}</td>
                  <td className="px-4 py-2 text-slate-500">{l.city}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => edit(l)} className="font-semibold text-brand-blue hover:underline">Edit</button>
                    <button onClick={() => remove(l)} className="ml-3 font-semibold text-red-600 hover:underline">Delete</button>
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
