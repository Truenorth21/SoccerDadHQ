"use client";

import { useState } from "react";

export default function PartnerInquiryForm({ defaultTier = "" }: { defaultTier?: string }) {
  const [f, setF] = useState({
    tier: defaultTier || "Not sure yet",
    org: "",
    org_type: "Club",
    contact: "",
    email: "",
    phone: "",
    goals: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/partner-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your inquiry.");
      setStatus("done");
      setMessage(data.message || "Thanks! We'll reach out to schedule your kickoff call.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="card border-l-4 border-emerald-400 p-6 text-sm text-emerald-800">
        ✓ {message}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <h3 className="font-heading text-xl font-bold uppercase text-navy">Become a Premier Partner</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Interested tier</label>
          <select className="input" value={f.tier} onChange={(e) => setF({ ...f, tier: e.target.value })}>
            <option>Not sure yet</option>
            <option>Gold — $3,000/yr</option>
            <option>Platinum — $6,000/yr</option>
          </select>
        </div>
        <div>
          <label className="label">Organization type</label>
          <select className="input" value={f.org_type} onChange={(e) => setF({ ...f, org_type: e.target.value })}>
            <option>Club</option>
            <option>High School</option>
            <option>Training Center</option>
            <option>Tournament / Camp</option>
            <option>Business / Brand</option>
          </select>
        </div>
        <div>
          <label className="label">Organization name</label>
          <input required className="input" value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} />
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
        <label className="label">What are your goals?</label>
        <textarea className="input min-h-[90px]" value={f.goals} onChange={(e) => setF({ ...f, goals: e.target.value })} placeholder="Recruiting exposure, tryout registrations, brand awareness…" />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <button type="submit" disabled={status === "loading"} className="btn-primary">
        {status === "loading" ? "Submitting…" : "Request a partnership call"}
      </button>
      <p className="text-xs text-slate-400">No commitment — we'll schedule a kickoff call to map out goals and an editorial calendar.</p>
    </form>
  );
}
