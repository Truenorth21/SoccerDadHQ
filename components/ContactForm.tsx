"use client";

import { useState } from "react";

export default function ContactForm({
  recipient,
  subjectType,
  subjectSlug,
  subjectName,
}: {
  recipient: string;
  subjectType?: string;
  subjectSlug?: string;
  subjectName?: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  if (sent) {
    return (
      <div className="card border-l-4 border-emerald-400 p-5 text-sm text-emerald-800">
        ✓ Your message to {recipient} has been sent. They&rsquo;ll see it in their SoccerDadHQ dashboard and can reply to the email you provided.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_type: subjectType,
          subject_slug: subjectSlug,
          subject_name: subjectName ?? recipient,
          from_name: form.name,
          from_email: form.email,
          body: form.message,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not send.");
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <h3 className="font-heading text-lg font-bold text-navy">Contact {recipient}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" className="input" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <textarea
        required
        className="input min-h-[100px]"
        placeholder="Tell them about your player, age group, and what you're looking for…"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary">{busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}
