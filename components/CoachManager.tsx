"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegionOpt {
  key: string;
  name: string;
}
type Row = Record<string, any>;

const BLANK: Row = {
  id: "", slug: "", name: "", region: "", city: "", club_name: "", title: "",
  bio: "", certifications: "", specialties: "", age_groups: "", genders: [],
  private_training: false, private_training_note: "", email: "", phone: "",
  photo_color: "#1a4fa0", featured: false,
};

export default function CoachManager({ coaches, regions }: { coaches: Row[]; regions: RegionOpt[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Row | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [msg, setMsg] = useState("");

  function edit(c: Row) {
    const join = (v: any) => (Array.isArray(v) ? v.join(", ") : v ?? "");
    setForm({
      ...c,
      certifications: join(c.certifications),
      specialties: join(c.specialties),
      age_groups: join(c.age_groups),
      genders: Array.isArray(c.genders) ? c.genders : [],
      city: c.city ?? "", club_name: c.club_name ?? "", title: c.title ?? "", bio: c.bio ?? "",
      private_training_note: c.private_training_note ?? "", email: c.email ?? "", phone: c.phone ?? "",
    });
    setStatus("idle"); setMsg("");
  }
  const addNew = () => { setForm({ ...BLANK }); setStatus("idle"); setMsg(""); };
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
      const res = await fetch("/api/admin/coaches", {
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
  async function remove(c: Row) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    await fetch("/api/admin/coaches", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{coaches.length} real coach{coaches.length === 1 ? "" : "es"} in the database (override seed, show live).</p>
        <button onClick={addNew} className="btn-primary text-sm">+ Add coach</button>
      </div>

      {form && (
        <form onSubmit={save} className="card space-y-4 p-5">
          <h3 className="font-heading text-lg font-bold uppercase text-navy">{form.id ? "Edit coach" : "New coach"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="label">Name *</span><input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Maria González" /></label>
            <label className="block"><span className="label">Slug {form.id ? "(locked)" : "(auto)"}</span><input className="input" value={form.slug} disabled={!!form.id} onChange={(e) => set("slug", e.target.value)} /></label>
            <label className="block"><span className="label">Region *</span>
              <select required className="input" value={form.region} onChange={(e) => set("region", e.target.value)}>
                <option value="">Select region…</option>
                {regions.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>
            </label>
            <label className="block"><span className="label">City</span><input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} /></label>
            <label className="block"><span className="label">Club</span><input className="input" value={form.club_name} onChange={(e) => set("club_name", e.target.value)} placeholder="Weston FC" /></label>
            <label className="block"><span className="label">Title</span><input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Director of Coaching" /></label>
            <label className="block sm:col-span-2"><span className="label">Bio</span><textarea className="input min-h-[70px]" value={form.bio} onChange={(e) => set("bio", e.target.value)} /></label>
            <label className="block"><span className="label">Certifications (comma-sep)</span><input className="input" value={form.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="USSF A, NSCAA Premier" /></label>
            <label className="block"><span className="label">Specialties (comma-sep)</span><input className="input" value={form.specialties} onChange={(e) => set("specialties", e.target.value)} placeholder="Goalkeeping, Attacking" /></label>
            <label className="block"><span className="label">Age groups (comma-sep)</span><input className="input" value={form.age_groups} onChange={(e) => set("age_groups", e.target.value)} placeholder="U12, U19" /></label>
            <div className="block"><span className="label">Coaches</span>
              <div className="mt-1 flex gap-4 text-sm">
                {["Boys", "Girls"].map((g) => (
                  <label key={g} className="flex items-center gap-1.5"><input type="checkbox" checked={(form.genders as string[]).includes(g)} onChange={() => toggleGender(g)} /> {g}</label>
                ))}
              </div>
            </div>
            <label className="block"><span className="label">Email</span><input className="input" value={form.email} onChange={(e) => set("email", e.target.value)} /></label>
            <label className="block"><span className="label">Phone</span><input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></label>
            <label className="block"><span className="label">Photo color</span><input type="color" className="input h-10 w-20 p-1" value={form.photo_color} onChange={(e) => set("photo_color", e.target.value)} /></label>
            <label className="block sm:col-span-2"><span className="label">Private training note</span><input className="input" value={form.private_training_note} onChange={(e) => set("private_training_note", e.target.value)} placeholder="1:1 sessions in West Broward, $X/hr" /></label>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!form.private_training} onChange={(e) => set("private_training", e.target.checked)} /> Offers private training</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
          </div>
          {status === "error" && <p className="text-sm text-red-600">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={status === "saving"} className="btn-primary">{status === "saving" ? "Saving…" : "Save coach"}</button>
            <button type="button" onClick={() => setForm(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {coaches.length > 0 && (
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-2">Coach</th><th className="px-4 py-2">Club</th><th className="px-4 py-2">Region</th><th className="px-4 py-2"></th></tr>
            </thead>
            <tbody>
              {coaches.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-navy">{c.name} {c.featured && <span className="text-brand-amber">★</span>}</td>
                  <td className="px-4 py-2 text-slate-500">{c.club_name ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500">{regions.find((r) => r.key === c.region)?.name ?? c.region}</td>
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
