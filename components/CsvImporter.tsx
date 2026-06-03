"use client";

import { useState } from "react";
import Link from "next/link";

const TEMPLATE = `name,region,city,zip,website,leagues,age_groups,genders,description,tryouts_open,tryout_note,featured
"Weston FC",south-florida,Weston,33326,https://westonfc.com,ECNL;MLS NEXT,U8;U9;U10;U11;U19,Boys;Girls,"Competitive youth club in West Broward.",true,"Tryouts late May",false
"Kendall Soccer Coalition",south-florida,Miami,33186,,Florida State Premier League (FSPL),U6;U7;U8;U19,Boys;Girls,"Community club in South Miami-Dade.",false,,false`;

interface Result {
  imported?: number;
  skipped?: number;
  errors?: string[];
  error?: string;
}

export default function CsvImporter() {
  const [csv, setCsv] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);

  // rough row count (non-empty lines minus header)
  const rowCount = Math.max(0, csv.trim().split("\n").filter((l) => l.trim()).length - 1);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then(setCsv);
  }

  async function submit() {
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/admin/clubs/import", {
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
          <li>• First row must be a <strong>header</strong>. Required columns: <code>name</code>, <code>region</code>, <code>city</code>.</li>
          <li>• Optional: <code>zip, website, email, phone, leagues, age_groups, genders, description, logo_color, lat, lng, tryouts_open, tryout_note, featured, slug</code>.</li>
          <li>• <strong>Region</strong> can be a key (<code>south-florida</code>) or name (<code>South Florida</code>).</li>
          <li>• For multiple <strong>leagues / age groups / genders</strong>, separate with <code>;</code> or <code>|</code> inside the cell (e.g. <code>ECNL;MLS NEXT</code>).</li>
          <li>• Re-importing the same club (same name/slug) <strong>updates</strong> it — safe to run again.</li>
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

      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        placeholder="Paste CSV here (or upload a file / load the template)…"
        className="input min-h-[220px] font-mono text-xs"
      />

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={status === "loading" || rowCount < 1} className="btn-primary">
          {status === "loading" ? "Importing…" : `Import ${rowCount || ""} club${rowCount === 1 ? "" : "s"}`}
        </button>
        <Link href="/admin/clubs" className="btn-outline">← Back to clubs</Link>
      </div>

      {result && (
        <div className={`card p-5 ${status === "error" ? "border-l-4 border-red-400" : "border-l-4 border-emerald-400"}`}>
          {result.error && <p className="font-semibold text-red-600">{result.error}</p>}
          {result.imported != null && (
            <p className="font-heading text-lg font-bold text-navy">
              ✓ Imported {result.imported} club{result.imported === 1 ? "" : "s"}
              {result.skipped ? `, skipped ${result.skipped}` : ""}
            </p>
          )}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-amber-700">
              {result.errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          )}
          {result.imported ? (
            <Link href="/clubs?region=south-florida" className="link-arrow mt-3 inline-block text-sm">
              View them in the directory →
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
