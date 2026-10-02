"use client";

import { useMemo, useRef, useState } from "react";

type RegionOpt = { key: string; name: string; state: string };
type StateOpt = { code: string; name: string };
type Audience = Record<string, { total: number; regions: Record<string, number> }>;
type SendRow = {
  id: string;
  state: string;
  status: "sending" | "sent";
  approved_by: string | null;
  approved_at: string;
  recipients: number;
  delivered: number;
  failed: number;
};

export default function NewsletterAdmin({
  initialIntro,
  adminEmail,
  regions,
  states,
  audience,
  sends,
  setupNeeded,
  emailConfigured,
}: {
  initialIntro: string;
  adminEmail: string;
  regions: RegionOpt[];
  states: StateOpt[];
  audience: Audience;
  sends: SendRow[];
  setupNeeded: boolean;
  emailConfigured: boolean;
}) {
  const [intro, setIntro] = useState(initialIntro);
  const [introStatus, setIntroStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [introMsg, setIntroMsg] = useState("");
  const introRef = useRef<HTMLTextAreaElement>(null);

  // The intro goes to every state, so a state typed by name (e.g. "Florida")
  // would show up in every other state's email too.
  const namedStates = useMemo(
    () => states.filter((s) => new RegExp(`\\b${s.name}\\b`, "i").test(intro)).map((s) => s.name),
    [states, intro]
  );

  function insertTag(tag: string) {
    const el = introRef.current;
    const at = el ? el.selectionStart : intro.length;
    const end = el ? el.selectionEnd : intro.length;
    setIntro(intro.slice(0, at) + tag + intro.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + tag.length, at + tag.length);
    });
  }

  // States with subscribers first (most subscribers on top), then the rest A–Z.
  const stateOptions = useMemo(() => {
    const withSubs = states.filter((s) => audience[s.code]?.total).sort((a, b) => audience[b.code].total - audience[a.code].total);
    const without = states.filter((s) => !audience[s.code]?.total);
    return { withSubs, without };
  }, [states, audience]);
  const nameOf = (code: string) => states.find((s) => s.code === code)?.name ?? code;

  const [state, setState] = useState(stateOptions.withSubs[0]?.code ?? "FL");
  const [region, setRegion] = useState("");
  const stateRegions = regions.filter((r) => r.state === state);
  const stateAudience = audience[state] ?? { total: 0, regions: {} };
  const previewUrl = `/api/admin/newsletter-preview?state=${state}${region ? `&region=${encodeURIComponent(region)}` : ""}`;
  const [previewKey, setPreviewKey] = useState(0);

  const [email, setEmail] = useState(adminEmail);
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [testMsg, setTestMsg] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [sendMsg, setSendMsg] = useState("");
  const [history, setHistory] = useState<SendRow[]>(sends);
  const lastForState = history.find((s) => s.state === state);
  const resuming = lastForState?.status === "sending";

  function pickState(code: string) {
    setState(code);
    setRegion("");
    setConfirmOpen(false);
    setConfirmText("");
    setSendStatus("idle");
    setSendMsg("");
  }

  async function readJson(res: Response) {
    const raw = await res.text();
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(raw.slice(0, 200) || `Request failed (${res.status}).`);
    }
  }

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
      setPreviewKey((k) => k + 1);
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
        body: JSON.stringify({ state, region, email }),
      });
      const d = await readJson(res);
      if (!res.ok) throw new Error(d.error || `Send failed (${res.status}).`);
      setTestStatus("ok");
      setTestMsg(`Test ${d.edition} edition sent to ${d.to}.`);
    } catch (err: any) {
      setTestStatus("error");
      setTestMsg(err.message);
    }
  }

  async function approveAndSend(e: React.FormEvent) {
    e.preventDefault();
    setSendStatus("sending");
    setSendMsg("");
    try {
      const res = await fetch("/api/admin/newsletter-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, confirm: confirmText }),
      });
      const d = await readJson(res);
      if (!res.ok) throw new Error(d.error || `Send failed (${res.status}).`);
      const row: SendRow = d;
      setHistory((h) => [row, ...h.filter((x) => x.id !== row.id)]);
      setSendStatus("ok");
      setSendMsg(
        d.finished
          ? `Done. ${d.delivered} of ${d.recipients} ${nameOf(state)} subscribers emailed${d.failed ? ` (${d.failed} failed)` : ""}.`
          : `Sent ${d.delivered} of ${d.recipients} so far. Click the button again to keep going (nobody gets it twice), or the rest go out automatically within a day.`
      );
      setConfirmOpen(false);
      setConfirmText("");
    } catch (err: any) {
      setSendStatus("error");
      setSendMsg(err.message);
    }
  }

  const confirmWord = `SEND ${state}`;

  return (
    <div className="space-y-8">
      {setupNeeded && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>One-time setup needed:</strong> run <code>supabase/state-newsletters-migration.sql</code> in the Supabase SQL
          editor. Previews work now; sending stays off until then.
        </div>
      )}

      {/* Editorial intro */}
      <form onSubmit={saveIntro} className="card space-y-3 p-5">
        <div>
          <h3 className="font-heading text-lg font-bold uppercase text-navy">This week&rsquo;s intro</h3>
          <p className="text-sm text-slate-500">
            A short note from you at the top of every state&rsquo;s edition (leave blank to skip). Write{" "}
            <strong>{"{state}"}</strong> where the state&rsquo;s name should go, and it becomes &ldquo;Colorado&rdquo; in the
            Colorado email, &ldquo;Texas&rdquo; in the Texas one, and so on. <strong>{"{region}"}</strong> becomes the
            region&rsquo;s name (like &ldquo;Tampa Bay&rdquo;), or the state&rsquo;s name for the state-wide edition.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => insertTag("{state}")} className="btn-outline text-xs">+ Insert {"{state}"}</button>
          <button type="button" onClick={() => insertTag("{region}")} className="btn-outline text-xs">+ Insert {"{region}"}</button>
        </div>
        <textarea
          ref={introRef}
          className="input min-h-[120px]"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="Welcome to The Sideline, your weekly five-minute catch-up on {state} youth soccer…"
        />
        {namedStates.length > 0 && (
          <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-900">
            Heads up: this names {namedStates.join(", ")}, which every state&rsquo;s subscribers will see. Swap it for{" "}
            <strong>{"{state}"}</strong> if it should change per state.
          </p>
        )}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={introStatus === "saving"} className="btn-primary">
            {introStatus === "saving" ? "Saving…" : "Save intro"}
          </button>
          {introStatus === "saved" && <span className="text-sm font-semibold text-emerald-700">✓ Saved</span>}
          {introStatus === "error" && <span className="text-sm text-red-600">{introMsg}</span>}
        </div>
      </form>

      {/* Preview + approve */}
      <div className="card space-y-4 p-5">
        <div>
          <h3 className="font-heading text-lg font-bold uppercase text-navy">Preview &amp; approve a state</h3>
          <p className="text-sm text-slate-500">
            Nothing goes out until you approve it here. Each subscriber gets their region&rsquo;s edition, or the state-wide one if
            they didn&rsquo;t pick a region.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label">State</span>
            <select className="input" value={state} onChange={(e) => pickState(e.target.value)}>
              {stateOptions.withSubs.length > 0 && (
                <optgroup label="Have subscribers">
                  {stateOptions.withSubs.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({audience[s.code].total})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="No subscribers yet">
                {stateOptions.without.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="block">
            <span className="label">Edition to preview</span>
            <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">State-wide ({stateAudience.regions[""] ?? 0})</option>
              {stateRegions.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name} ({stateAudience.regions[r.key] ?? 0})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span>Exactly what subscribers will see</span>
            <a href={previewUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700">Open full size ↗</a>
          </div>
          <iframe key={`${previewUrl}-${previewKey}`} src={previewUrl} title="Newsletter preview" className="h-[640px] w-full bg-white" />
        </div>

        {/* Test send */}
        <form onSubmit={sendTest} className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
          <label className="block min-w-[240px] flex-1">
            <span className="label">Send a test of this edition to</span>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" disabled={testStatus === "sending" || !emailConfigured} className="btn-outline">
            {testStatus === "sending" ? "Sending…" : "Send test to me"}
          </button>
          {testStatus === "ok" && <span className="w-full text-sm font-semibold text-emerald-700">✓ {testMsg}</span>}
          {testStatus === "error" && <span className="w-full text-sm text-red-600">{testMsg}</span>}
        </form>

        {/* Approve */}
        <div className="border-t border-slate-100 pt-4">
          {!emailConfigured ? (
            <p className="text-sm text-slate-500">Sending is off: add <code>RESEND_API_KEY</code> in Vercel to turn it on.</p>
          ) : stateAudience.total === 0 && !resuming ? (
            <p className="text-sm text-slate-500">{nameOf(state)} has no subscribers yet, so there&rsquo;s nobody to send to.</p>
          ) : !confirmOpen ? (
            <button type="button" disabled={setupNeeded} onClick={() => setConfirmOpen(true)} className="btn-amber">
              {resuming
                ? `Finish sending ${nameOf(state)} (${lastForState!.delivered} of ${lastForState!.recipients} done)`
                : `Approve & send to ${stateAudience.total} ${nameOf(state)} subscriber${stateAudience.total === 1 ? "" : "s"}`}
            </button>
          ) : (
            <form onSubmit={approveAndSend} className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                This emails <strong>every {nameOf(state)} subscriber</strong> for real and can&rsquo;t be undone. Type{" "}
                <strong>{confirmWord}</strong> to confirm.
              </p>
              <input
                className="input max-w-[200px] uppercase"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmWord}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sendStatus === "sending" || confirmText.trim().toUpperCase() !== confirmWord}
                  className="btn-amber"
                >
                  {sendStatus === "sending" ? "Sending… keep this page open" : "Yes, send it"}
                </button>
                <button type="button" disabled={sendStatus === "sending"} onClick={() => { setConfirmOpen(false); setConfirmText(""); }} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          )}
          {sendStatus === "ok" && <p className="mt-3 text-sm font-semibold text-emerald-700">✓ {sendMsg}</p>}
          {sendStatus === "error" && <p className="mt-3 text-sm text-red-600">{sendMsg}</p>}
        </div>
      </div>

      {/* History */}
      <div className="card p-5">
        <h3 className="font-heading text-lg font-bold uppercase text-navy">Sent so far</h3>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No state newsletters sent yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-1 pr-4">When</th>
                  <th className="py-1 pr-4">State</th>
                  <th className="py-1 pr-4">Delivered</th>
                  <th className="py-1 pr-4">Status</th>
                  <th className="py-1">Approved by</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{new Date(s.approved_at).toLocaleString()}</td>
                    <td className="py-2 pr-4">{nameOf(s.state)}</td>
                    <td className="py-2 pr-4">
                      {s.delivered} / {s.recipients}
                      {s.failed ? <span className="text-red-600"> ({s.failed} failed)</span> : null}
                    </td>
                    <td className="py-2 pr-4">{s.status === "sent" ? "Sent" : "In progress"}</td>
                    <td className="py-2 text-slate-500">{s.approved_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Newsletters never send on a schedule anymore: each state goes out only when you approve it above. A daily check
        finishes any approved send that stopped part-way. To sponsor a single region&rsquo;s edition, tag an ad creative with
        that region in <strong>Ads</strong>.
      </p>
    </div>
  );
}
