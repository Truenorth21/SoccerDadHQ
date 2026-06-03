"use client";

import { useState } from "react";
import { COMMITMENT_TYPES, NCAA_DIVISIONS, PLAYER_POSITIONS, GRAD_YEARS } from "@/lib/regions";

export default function CommitmentForm({
  subjectType,
  subjectSlug,
  subjectName,
}: {
  subjectType: "club" | "school";
  subjectSlug: string;
  subjectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    player_name: "",
    grad_year: String(GRAD_YEARS[2]),
    gender: "Boys",
    position: "Midfielder",
    dest_type: "College",
    destination: "",
    division: "NCAA D1",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/commitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_type: subjectType, subject_slug: subjectSlug, subject_name: subjectName, ...f }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setStatus("done");
      setMessage(data.message || "Commitment submitted for review.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return <div className="card border-l-4 border-emerald-400 p-4 text-sm text-emerald-800">✓ {message}</div>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        + Announce a commitment
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <h4 className="font-heading text-lg font-bold text-navy">Announce a commitment</h4>
      <input required className="input" placeholder="Player name" value={f.player_name} onChange={(e) => setF({ ...f, player_name: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <select className="input" value={f.grad_year} onChange={(e) => setF({ ...f, grad_year: e.target.value })}>
          {GRAD_YEARS.map((y) => <option key={y} value={y}>Class of {y}</option>)}
        </select>
        <select className="input" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}>
          <option>Boys</option>
          <option>Girls</option>
        </select>
        <select className="input" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })}>
          {PLAYER_POSITIONS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="input" value={f.dest_type} onChange={(e) => setF({ ...f, dest_type: e.target.value })}>
          {COMMITMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <input required className="input" placeholder="Destination (e.g. University of Florida)" value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} />
      {f.dest_type === "College" && (
        <select className="input" value={f.division} onChange={(e) => setF({ ...f, division: e.target.value })}>
          {NCAA_DIVISIONS.map((d) => <option key={d}>{d}</option>)}
        </select>
      )}
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === "loading"} className="btn-primary">{status === "loading" ? "Submitting…" : "Submit"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
