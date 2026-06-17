"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Group = { id: string; name: string };
type Msg = Record<string, any>;

export default function MessageComposer({ groups, sent }: { groups: Group[]; sent: Msg[] }) {
  const router = useRouter();
  const [f, setF] = useState({ audience: "all", group_id: groups[0]?.id ?? "", email: "", subject: "", body: "", email_copy: true });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not send.");
      setStatus("ok");
      setMsg(`Sent to ${d.recipients} recipient${d.recipients === 1 ? "" : "s"}${d.emailed ? ` · emailed ${d.emailed}` : ""}.`);
      setF({ ...f, subject: "", body: "", email: "" });
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message);
    }
  }

  const audienceLabel = (m: Msg) =>
    m.audience === "all" ? "All users" : m.audience === "group" ? `Group: ${groups.find((g) => g.id === m.target_group)?.name ?? "—"}` : "Individual";

  return (
    <div className="space-y-6">
      <form onSubmit={send} className="card space-y-4 p-5">
        <div>
          <span className="label">Send to</span>
          <div className="flex flex-wrap gap-2">
            {[
              { v: "all", l: "All users" },
              { v: "group", l: "A group" },
              { v: "user", l: "One user" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setF({ ...f, audience: o.v })}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  f.audience === o.v ? "bg-brand-sky text-white" : "bg-slate-100 text-navy hover:bg-slate-200"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {f.audience === "group" && (
          <label className="block">
            <span className="label">Group</span>
            <select className="input" value={f.group_id} onChange={(e) => setF({ ...f, group_id: e.target.value })}>
              {groups.length === 0 ? <option value="">No groups yet — create one below</option> : groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        )}
        {f.audience === "user" && (
          <label className="block">
            <span className="label">Recipient email</span>
            <input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="member@email.com" />
          </label>
        )}

        <label className="block">
          <span className="label">Subject</span>
          <input required className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="A quick update from SoccerDadHQ" />
        </label>
        <label className="block">
          <span className="label">Message</span>
          <textarea required className="input min-h-[120px]" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={f.email_copy} onChange={(e) => setF({ ...f, email_copy: e.target.checked })} />
          Also email this (in addition to their dashboard inbox)
        </label>

        {status === "ok" && <p className="text-sm font-semibold text-emerald-700">✓ {msg}</p>}
        {status === "error" && <p className="text-sm text-red-600">{msg}</p>}
        <button type="submit" disabled={status === "sending"} className="btn-primary">
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>

      <div>
        <h3 className="mb-2 font-heading text-lg font-bold uppercase text-navy">Recent messages</h3>
        {sent.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">No messages sent yet.</p>
        ) : (
          <ul className="space-y-2">
            {sent.map((m) => (
              <li key={m.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-navy">{m.subject}</p>
                    <p className="truncate text-sm text-slate-500">{m.body}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-400">
                    <p>{audienceLabel(m)}</p>
                    <p>{new Date(m.created_at).toLocaleDateString()}</p>
                    {m.emailed && <p className="text-emerald-600">✉ emailed</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
