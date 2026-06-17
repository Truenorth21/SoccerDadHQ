"use client";

import { useState } from "react";

type Msg = { id: string; subject: string; body: string; created_at: string; unread: boolean };

export default function Inbox({ messages }: { messages: Msg[] }) {
  const [items, setItems] = useState(messages);
  const [open, setOpen] = useState<string | null>(null);

  if (items.length === 0) return null;

  const unread = items.filter((m) => m.unread).length;

  function toggle(m: Msg) {
    setOpen((o) => (o === m.id ? null : m.id));
    if (m.unread) {
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, unread: false } : x)));
      fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id }),
      }).catch(() => {});
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-heading text-2xl font-bold text-navy">
        Messages
        {unread > 0 && (
          <span className="rounded-full bg-brand-sky px-2 py-0.5 text-xs font-bold text-white">{unread} new</span>
        )}
      </h2>
      <ul className="space-y-2">
        {items.map((m) => (
          <li key={m.id} className={`card overflow-hidden ${m.unread ? "ring-1 ring-brand-sky/40" : ""}`}>
            <button onClick={() => toggle(m)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className={`h-2 w-2 shrink-0 rounded-full ${m.unread ? "bg-brand-sky" : "bg-transparent"}`} />
              <span className={`min-w-0 flex-1 truncate ${m.unread ? "font-heading font-bold text-navy" : "text-slate-600"}`}>
                {m.subject}
              </span>
              <span className="shrink-0 text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span>
            </button>
            {open === m.id && (
              <p className="whitespace-pre-wrap border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {m.body}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
