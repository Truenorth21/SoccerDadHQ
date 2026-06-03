"use client";

import { useState } from "react";
import Link from "next/link";

const TEMPLATE = `name,region,city,club_name,title,specialties,age_groups,genders,private_training,featured
"Maria Gonzalez",south-florida,Weston,Weston FC,Director of Coaching,Attacking;Possession,U12;U19,Boys;Girls,true,false
"David Cole",south-florida,Miami,Kendall Soccer Coalition,Goalkeeper Trainer,Goalkeeping,U10;U19,Boys;Girls,true,false`;

interface Result {
  imported?: number;
  skipped?: number;
  errors?: string[];
  error?: string;
}

export default function CoachCsvImporter() {
  const [csv, setCsv] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const rowCount = Math.max(0, csv.trim().split("\n").filter((l) => l.trim()).length - 1);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) f.text().then(setCsv);
  }
  async function submit() {
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/admin/coaches/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const d: Result = await res.json();
      setResult(d);
      setStatus(res.ok ? "done" : "error");
    } catch (err: any) {
      setResult({ error: err.message });
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-heading text-lg font-bold uppercase text-navy">How it works</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>• Header row required. Required columns: <code>name</code>, <code>region</code>.</li>
          <li>• Optional: <code>city, club_name, title, bio, specialties, certifications, age_groups, genders, private_training, private_training_note, email, phone, photo_color, featured, slug</code>.</li>
          <li>• <strong>Region</strong>: key (<code>south-florida</code>) or name (<code>South Florida</code>).</li>
          <li>• Multi-value cells (<code>specialties, age_groups, genders, certifications</code>): separate with <code>;</code> or <code>|</code>.</li>
          <li>• Re-importing the same coach <strong>updates</strong> them.</li>
        </ul>
        <button onClick={() => setCsv(TEMPLATE)} className="btn-outline mt-3 text-sm">Load example template</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-outline cursor-pointer text-sm">
          Upload .csv
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
        </label>
        <span className="text-sm text-slate-500">…or paste below. {rowCount > 0 && <strong>{rowCount} row{rowCount === 1 ? "" : "s"} detected</strong>}</span>
      </div>

      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="Paste CSV here…" className="input min-h-[220px] font-mono text-xs" />

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={status === "loading" || rowCount < 1} className="btn-primary">
          {status === "loading" ? "Importing…" : `Import ${rowCount || ""} coach${rowCount === 1 ? "" : "es"}`}
        </button>
        <Link href="/admin/coaches" className="btn-outline">← Back to coaches</Link>
      </div>

      {result && (
        <div className={`card p-5 ${status === "error" ? "border-l-4 border-red-400" : "border-l-4 border-emerald-400"}`}>
          {result.error && <p className="font-semibold text-red-600">{result.error}</p>}
          {result.imported != null && (
            <p className="font-heading text-lg font-bold text-navy">✓ Imported {result.imported} coach{result.imported === 1 ? "" : "es"}{result.skipped ? `, skipped ${result.skipped}` : ""}</p>
          )}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-amber-700">{result.errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
          )}
          {result.imported ? <Link href="/coaches?region=south-florida" className="link-arrow mt-3 inline-block text-sm">View them in the directory →</Link> : null}
        </div>
      )}
    </div>
  );
}
