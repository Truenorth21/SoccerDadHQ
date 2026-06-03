"use client";

import { useState } from "react";

export default function ContactForm({ recipient }: { recipient: string }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  if (sent) {
    return (
      <div className="card border-l-4 border-emerald-400 p-5 text-sm text-emerald-800">
        ✓ Your message to {recipient} has been sent. They'll be in touch via the email you provided.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // In production this would POST to a messaging endpoint / email service.
        setSent(true);
      }}
      className="card space-y-3 p-5"
    >
      <h3 className="font-heading text-lg font-bold text-navy">Contact {recipient}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          className="input"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          type="email"
          className="input"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <textarea
        required
        className="input min-h-[100px]"
        placeholder="Tell the coach about your player, age group, and what you're looking for…"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button type="submit" className="btn-primary">Send message</button>
    </form>
  );
}
