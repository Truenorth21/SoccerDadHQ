"use client";

import { useState } from "react";
import Link from "next/link";

const TEMPLATE = `name,region,city,type,fhsaa_class,district,mascot,programs,website,state_titles,featured
"American Heritage School",south-florida,Plantation,Private,Class 4A,District 14,Patriots,Boys;Girls,https://www.ahschool.com,3,true
"Belen Jesuit Preparatory",south-florida,Miami,Private,Class 5A,District 16,Wolverines,Boys,https://www.belenjesuit.org,2,false`;

interface Result {
  imported?: number;
  skipped?: number;
  errors?: string[];
  error?: string;
}

export default function SchoolCsvImporter() {
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
      const res = await fetch("/api/admin/schools/import", {
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
          <li>• Header row required. Required columns: <code>name</code>, <code>region</code>, <code>city</code>.</li>
          <li>• Optional: <code>type</code> (Public/Private), <code>fhsaa_class, district, mascot, programs, website, zip, state_titles, district_titles, enrollment, head_coach_boys, head_coach_girls, logo_color, featured, slug</code>.</li>
          <li>• <strong>Region</strong>: key (<code>south-florida</code>) or name (<code>South Florida</code>).</li>
          <li>• <strong>programs</strong>: separate with <code>;</code> (e.g. <code>Boys;Girls</code>).</li>
          <li>• Re-importing the same school <strong>updates</strong> it.</li>
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
          {status === "loading" ? "Importing…" : `Import ${rowCount || ""} school${rowCount === 1 ? "" : "s"}`}
        </button>
        <Link href="/admin/schools" className="btn-outline">← Back to schools</Link>
      </div>

      {result && (
        <div className={`card p-5 ${status === "error" ? "border-l-4 border-red-400" : "border-l-4 border-emerald-400"}`}>
          {result.error && <p className="font-semibold text-red-600">{result.error}</p>}
          {result.imported != null && (
            <p className="font-heading text-lg font-bold text-navy">✓ Imported {result.imported} school{result.imported === 1 ? "" : "s"}{result.skipped ? `, skipped ${result.skipped}` : ""}</p>
          )}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-amber-700">{result.errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
          )}
          {result.imported ? <Link href="/schools?region=south-florida" className="link-arrow mt-3 inline-block text-sm">View them in the directory →</Link> : null}
        </div>
      )}
    </div>
  );
}
