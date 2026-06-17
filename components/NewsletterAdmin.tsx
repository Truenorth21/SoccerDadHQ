"use client";

import { useState } from "react";

type RegionOpt = { key: string; name: string };

export default function NewsletterAdmin({
  initialIntro,
  adminEmail,
  regions,
}: {
  initialIntro: string;
  adminEmail: string;
  regions: RegionOpt[];
}) {
  const [intro, setIntro] = useState(initialIntro);
  const [introStatus, setIntroStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [introMsg, setIntroMsg] = useState("");

  const [region, setRegion] = useState("statewide");
  const [email, setEmail] = useState(adminEmail);
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [testMsg, setTestMsg] = useState("");

  async function saveIntro(e: React.FormEvent) {
    e.preventDefault();
    setIntroStatus("saving");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "newsletter", value: { intro } }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      setIntroStatus("saved");
      setTimeout(() => setIntroStatus("idle"), 2000);
    } catch (err: any) {
      setIntroStatus("error");
      setIntroMsg(err.message);
    }
  }

  async function sendTest(e: React.FormEvent) {
    e.preventDefault();
    setTestStatus("sending");
    setTestMsg("");
    try {
      const res = await fetch("/api/admin/newsletter-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, email }),
      });
      const raw = await res.text();
      let d: any = {};
      try {
        d = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(raw.slice(0, 200) || `Request failed (${res.status}).`);
      }
      if (!res.ok) throw new Error(d.error || `Send failed (${res.status}).`);
      setTestStatus("ok");
      setTestMsg(`Test ${d.edition} edition sent to ${d.to}.`);
    } catch (err: any) {
      setTestStatus("error");
      setTestMsg(err.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Editorial intro */}
      <form onSubmit={saveIntro} className="card space-y-3 p-5">
        <div>
          <h3 className="font-heading text-lg font-bold uppercase text-navy">This week&rsquo;s intro</h3>
          <p className="text-sm text-slate-500">A short note from you at the top of every edition. Update it before the Tuesday send (leave blank to skip).</p>
        </div>
        <textarea
          className="input min-h-[120px]"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="Big tryout week across South Florida — plus three new commitments and the poll everyone's arguing about…"
        />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={introStatus === "saving"} className="btn-primary">
            {introStatus === "saving" ? "Saving…" : "Save intro"}
          </button>
          {introStatus === "saved" && <span className="text-sm font-semibold text-emerald-700">✓ Saved</span>}
          {introStatus === "error" && <span className="text-sm text-red-600">{introMsg}</span>}
        </div>
      </form>

      {/* Send a test */}
      <form onSubmit={sendTest} className="card space-y-3 p-5">
        <div>
          <h3 className="font-heading text-lg font-bold uppercase text-navy">Send a test</h3>
          <p className="text-sm text-slate-500">Preview an edition in your inbox before the weekly blast goes out.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label">Edition</span>
            <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="statewide">Statewide</option>
              {regions.map((r) => (
                <option key={r.key} value={r.key}>{r.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Send to</span>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={testStatus === "sending"} className="btn-outline">
            {testStatus === "sending" ? "Sending…" : "Send test to me"}
          </button>
          {testStatus === "ok" && <span className="text-sm font-semibold text-emerald-700">✓ {testMsg}</span>}
          {testStatus === "error" && <span className="text-sm text-red-600">{testMsg}</span>}
        </div>
      </form>

      <p className="text-xs text-slate-400">
        The weekly send runs automatically (Tuesdays, 13:00 UTC). To sponsor a single region&rsquo;s edition, tag an ad
        creative with that region in <strong>Ads</strong>.
      </p>
    </div>
  );
}
