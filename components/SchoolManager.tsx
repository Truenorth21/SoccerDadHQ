"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegionOpt {
  key: string;
  name: string;
}
type Row = Record<string, any>;

const BLANK: Row = {
  id: "", slug: "", name: "", region: "", city: "", zip: "",
  type: "Public", fhsaa_class: "", district: "", mascot: "",
  programs: [], website: "", head_coach_boys: "", head_coach_girls: "",
  state_titles: "", district_titles: "", enrollment: "",
  logo_color: "#1a4fa0", description: "", featured: false,
};

export default function SchoolManager({ schools, regions }: { schools: Row[]; regions: RegionOpt[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Row | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [msg, setMsg] = useState("");

  function edit(s: Row) {
    setForm({
      ...s,
      programs: Array.isArray(s.programs) ? s.programs : [],
      zip: s.zip ?? "", fhsaa_class: s.fhsaa_class ?? "", district: s.district ?? "", mascot: s.mascot ?? "",
      website: s.website ?? "", head_coach_boys: s.head_coach_boys ?? "", head_coach_girls: s.head_coach_girls ?? "",
      state_titles: s.state_titles ?? "", district_titles: s.district_titles ?? "", enrollment: s.enrollment ?? "",
      description: s.description ?? "", type: s.type ?? "Public",
    });
    setStatus("idle"); setMsg("");
  }
  const addNew = () => { setForm({ ...BLANK }); setStatus("idle"); setMsg(""); };
  const set = (k: string, v: any) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const toggleProgram = (g: string) =>
    setForm((f) => {
      if (!f) return f;
      const has = (f.programs as string[]).includes(g);
      return { ...f, programs: has ? (f.programs as string[]).filter((x) => x !== g) : [...(f.programs as string[]), g] };
    });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/schools", {
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
  async function remove(s: Row) {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await fetch("/api/admin/schools", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id }) });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{schools.length} real school{schools.length === 1 ? "" : "s"} in the database (override seed, show live).</p>
        <button onClick={addNew} className="btn-primary text-sm">+ Add school</button>
      </div>

      {form && (
        <form onSubmit={save} className="card space-y-4 p-5">
          <h3 className="font-heading text-lg font-bold uppercase text-navy">{form.id ? "Edit school" : "New school"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="label">Name *</span><input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="American Heritage School" /></label>
            <label className="block"><span className="label">Slug {form.id ? "(locked)" : "(auto)"}</span><input className="input" value={form.slug} disabled={!!form.id} onChange={(e) => set("slug", e.target.value)} /></label>
            <label className="block"><span className="label">Region *</span>
              <select required className="input" value={form.region} onChange={(e) => set("region", e.target.value)}>
                <option value="">Select region…</option>
                {regions.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>
            </label>
            <label className="block"><span className="label">City *</span><input required className="input" value={form.city} onChange={(e) => set("city", e.target.value)} /></label>
            <label className="block"><span className="label">Type</span>
              <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}><option>Public</option><option>Private</option></select>
            </label>
            <label className="block"><span className="label">FHSAA Class</span><input className="input" value={form.fhsaa_class} onChange={(e) => set("fhsaa_class", e.target.value)} placeholder="Class 6A" /></label>
            <label className="block"><span className="label">District</span><input className="input" value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="District 12" /></label>
            <label className="block"><span className="label">Mascot</span><input className="input" value={form.mascot} onChange={(e) => set("mascot", e.target.value)} placeholder="Patriots" /></label>
            <label className="block"><span className="label">ZIP</span><input className="input" value={form.zip} onChange={(e) => set("zip", e.target.value)} /></label>
            <label className="block"><span className="label">Website</span><input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" /></label>
            <div className="block"><span className="label">Programs</span>
              <div className="mt-1 flex gap-4 text-sm">
                {["Boys", "Girls"].map((g) => (
                  <label key={g} className="flex items-center gap-1.5"><input type="checkbox" checked={(form.programs as string[]).includes(g)} onChange={() => toggleProgram(g)} /> {g}</label>
                ))}
              </div>
            </div>
            <label className="block"><span className="label">Crest color</span><input type="color" className="input h-10 w-20 p-1" value={form.logo_color} onChange={(e) => set("logo_color", e.target.value)} /></label>
            <label className="block"><span className="label">Boys head coach</span><input className="input" value={form.head_coach_boys} onChange={(e) => set("head_coach_boys", e.target.value)} /></label>
            <label className="block"><span className="label">Girls head coach</span><input className="input" value={form.head_coach_girls} onChange={(e) => set("head_coach_girls", e.target.value)} /></label>
            <label className="block"><span className="label">State titles</span><input type="number" className="input" value={form.state_titles} onChange={(e) => set("state_titles", e.target.value)} /></label>
            <label className="block"><span className="label">District titles</span><input type="number" className="input" value={form.district_titles} onChange={(e) => set("district_titles", e.target.value)} /></label>
            <label className="block"><span className="label">Enrollment</span><input type="number" className="input" value={form.enrollment} onChange={(e) => set("enrollment", e.target.value)} /></label>
            <label className="block sm:col-span-2"><span className="label">Description</span><textarea className="input min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
          </div>
          <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
          {status === "error" && <p className="text-sm text-red-600">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={status === "saving"} className="btn-primary">{status === "saving" ? "Saving…" : "Save school"}</button>
            <button type="button" onClick={() => setForm(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {schools.length > 0 && (
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-2">School</th><th className="px-4 py-2">Region</th><th className="px-4 py-2">City</th><th className="px-4 py-2"></th></tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-navy">{s.name} {s.featured && <span className="text-brand-amber">★</span>}</td>
                  <td className="px-4 py-2 text-slate-500">{regions.find((r) => r.key === s.region)?.name ?? s.region}</td>
                  <td className="px-4 py-2 text-slate-500">{s.city}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => edit(s)} className="font-semibold text-brand-blue hover:underline">Edit</button>
                    <button onClick={() => remove(s)} className="ml-3 font-semibold text-red-600 hover:underline">Delete</button>
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
