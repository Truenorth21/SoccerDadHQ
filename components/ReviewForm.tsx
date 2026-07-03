"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StarInput } from "./Stars";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ReviewForm({
  subjectType,
  subjectId,
  subjectName,
  categories,
}: {
  subjectType: string;
  subjectId: string;
  subjectName: string;
  categories: readonly { key: string; label: string }[];
}) {
  const pathname = usePathname();
  // Auth gate: in demo mode (no Supabase) reviews stay open; with Supabase, login is required.
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email } : null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ? { email: session.user.email } : null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c.key, 0]))
  );
  const [author, setAuthor] = useState("");
  const [relationship, setRelationship] = useState("Parent");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const filled = categories.filter((c) => scores[c.key] > 0).length;
  const overall = filled
    ? Math.round((categories.reduce((a, c) => a + scores[c.key], 0) / filled) * 10) / 10
    : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (filled < categories.length) {
      setStatus("error");
      setMessage("Please rate all categories.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_type: subjectType,
          subject_id: subjectId,
          author_name: author || "Anonymous",
          relationship,
          title,
          body,
          scores,
          overall_rating: overall,
          age_confirmed: ageConfirmed,
          rules_accepted: rulesAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review");
      setStatus("done");
      setMessage(data.message || "Thanks! Your review was submitted.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="card border-l-4 border-emerald-400 p-5 text-emerald-800">
        ✓ {message}
      </div>
    );
  }

  // Require login when Supabase is configured.
  if (isSupabaseConfigured && authReady && !user) {
    return (
      <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-navy">Log in to write a review</h3>
          <p className="text-sm text-slate-500">
            Reviews are one per member per {subjectType} so ratings stay trustworthy.
          </p>
        </div>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary shrink-0">
          Log in to review
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <button onClick={() => setOpen(true)} className="btn-primary w-full sm:w-auto">
          Write a review
        </button>
        <p className="text-xs text-slate-500">
          Independent listing — SoccerDadHQ is not affiliated with or endorsed by this program, school or coach.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-5">
      <div>
        <h3 className="font-heading text-xl font-bold text-navy">Review {subjectName}</h3>
        <p className="text-sm text-slate-500">Rate each category from 1 to 5 stars.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <div key={c.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-600">
              {c.label}
            </span>
            <StarInput
              name={c.label}
              value={scores[c.key]}
              onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
            />
          </div>
        ))}
      </div>

      {overall > 0 && (
        <p className="text-sm text-slate-600">
          Overall: <span className="font-heading text-lg font-bold text-amber-700">{overall.toFixed(1)}</span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="label">You are a…</label>
          <select className="input" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
            <option>Parent</option>
            <option>Player</option>
            <option>Former Player</option>
            <option>Coach</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Review title</label>
        <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum it up in a few words" />
      </div>

      <div>
        <label className="label">Your review</label>
        <textarea className="input min-h-[120px]" required maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Focus on your first-hand soccer experience, communication, training, organization, cost or facilities." />
      </div>

      <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <label className="flex items-start gap-2">
          <input type="checkbox" required checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-1" />
          <span>I confirm that I am at least 13 years old.</span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" required checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)} className="mt-1" />
          <span>
            I agree to the <Link href="/terms" className="text-brand-blue hover:underline">review rules</Link>: no
            personal attacks, private information, named minors or unsupported allegations.
          </span>
        </label>
      </div>

      {status === "error" && <p className="text-sm text-red-600">{message}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={status === "loading"} className="btn-primary">
          {status === "loading" ? "Submitting…" : "Submit review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
