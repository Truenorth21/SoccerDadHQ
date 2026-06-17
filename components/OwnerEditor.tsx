"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type FieldType = "text" | "url" | "email" | "textarea" | "number" | "bool" | "list" | "date";
const FIELD_META: Record<string, { label: string; type: FieldType; hint?: string }> = {
  description: { label: "Description", type: "textarea" },
  bio: { label: "Bio", type: "textarea" },
  website: { label: "Website", type: "url", hint: "https://…" },
  email: { label: "Contact email", type: "email" },
  phone: { label: "Phone", type: "text" },
  instagram: { label: "Instagram URL", type: "url" },
  facebook: { label: "Facebook URL", type: "url" },
  twitter: { label: "X / Twitter URL", type: "url" },
  mascot: { label: "Mascot", type: "text" },
  title: { label: "Title", type: "text" },
  founded: { label: "Founded (year)", type: "number" },
  tryout_note: { label: "Tryout note", type: "textarea", hint: "e.g. Open tryouts every Sunday in August" },
  tryouts_open: { label: "Tryouts currently open", type: "bool" },
  next_tryout_date: { label: "Next tryout date", type: "date", hint: "Shows in the homepage tryout ticker" },
  private_training: { label: "Offers private training", type: "bool" },
  leagues: { label: "Leagues", type: "list", hint: "Comma-separated" },
  age_groups: { label: "Age groups", type: "list", hint: "Comma-separated, e.g. U9, U10, U11" },
  genders: { label: "Genders", type: "list", hint: "Comma-separated, e.g. Boys, Girls" },
  specialties: { label: "Specialties", type: "list", hint: "Comma-separated" },
  tags: { label: "Tags", type: "list", hint: "Comma-separated" },
};

interface OwnedReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  owner_reply?: string;
}


export default function OwnerEditor({
  subjectType,
  slug,
  name,
  allowed,
  initial,
  currentLogo,
  canLogo,
  reviews,
}: {
  subjectType: string;
  slug: string;
  name: string;
  allowed: string[];
  initial: Record<string, any>;
  currentLogo: string | null;
  canLogo: boolean;
  reviews: OwnedReview[];
}) {
  const fields = allowed.filter((k) => FIELD_META[k]);
  const [form, setForm] = useState<Record<string, any>>(() => {
    const f: Record<string, any> = {};
    for (const k of fields) {
      const meta = FIELD_META[k];
      const v = initial[k];
      f[k] = meta.type === "list" ? (Array.isArray(v) ? v.join(", ") : v ?? "") : meta.type === "bool" ? !!v : v ?? "";
    }
    return f;
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setSaved(false);
    const payload: Record<string, unknown> = {};
    for (const k of fields) {
      const meta = FIELD_META[k];
      const v = form[k];
      if (meta.type === "list") payload[k] = String(v).split(",").map((s) => s.trim()).filter(Boolean);
      else if (meta.type === "bool") payload[k] = !!v;
      else if (meta.type === "number") payload[k] = v === "" ? null : Number(v);
      else payload[k] = v;
    }
    try {
      const res = await fetch("/api/owner/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_type: subjectType, slug, fields: payload }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Core fields */}
      <form onSubmit={save} className="card space-y-4 p-6">
        <h2 className="font-heading text-xl font-bold text-navy">Profile details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((k) => {
            const meta = FIELD_META[k];
            const span = meta.type === "textarea" ? "sm:col-span-2" : "";
            if (meta.type === "bool") {
              return (
                <label key={k} className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                  <input type="checkbox" className="h-4 w-4 rounded accent-brand-sky" checked={!!form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
                  {meta.label}
                </label>
              );
            }
            return (
              <div key={k} className={span}>
                <label className="label">{meta.label}</label>
                {meta.type === "textarea" ? (
                  <textarea className="input min-h-[90px]" value={form[k]} placeholder={meta.hint} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                ) : (
                  <input
                    className="input"
                    type={meta.type === "number" ? "number" : meta.type === "email" ? "email" : meta.type === "url" ? "url" : meta.type === "date" ? "date" : "text"}
                    value={form[k]}
                    placeholder={meta.hint}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save changes"}</button>
          {saved && <span className="text-sm font-semibold text-emerald-700">✓ Saved — live on your profile</span>}
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
      </form>

      {/* Logo */}
      {canLogo && <LogoUploader subjectType={subjectType} slug={slug} currentLogo={currentLogo} />}

      {/* Reviews + replies */}
      <div className="card p-6">
        <h2 className="font-heading text-xl font-bold text-navy">Reviews</h2>
        <p className="mt-1 text-sm text-slate-500">Respond publicly to reviews from families. Replies show under each review.</p>
        {reviews.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <ReviewReply key={r.id} review={r} subjectType={subjectType} slug={slug} />
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-slate-400">
        Editing <strong className="text-slate-600">{name}</strong> · <Link href="/dashboard" className="text-brand-blue hover:underline">back to dashboard</Link>
      </p>
    </div>
  );
}

function LogoUploader({ subjectType, slug, currentLogo }: { subjectType: string; slug: string; currentLogo: string | null }) {
  const [url, setUrl] = useState(currentLogo);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [msg, setMsg] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setStatus("uploading");
    setMsg("");
    const form = new FormData();
    form.append("file", file);
    form.append("subject_type", subjectType);
    form.append("slug", slug);
    try {
      const res = await fetch("/api/owner/logo", { method: "POST", body: form });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed.");
      setUrl(d.url);
      setStatus("idle");
    } catch (e: any) {
      setStatus("error");
      setMsg(e.message);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-heading text-xl font-bold text-navy">Logo</h2>
      <div className="mt-3 flex items-center gap-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Logo" className="h-20 w-20 rounded-xl object-contain ring-1 ring-slate-200" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl bg-slate-100 text-slate-400">No logo</div>
        )}
        <div>
          <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button onClick={() => ref.current?.click()} disabled={status === "uploading"} className="btn-outline text-sm">
            {status === "uploading" ? "Uploading…" : url ? "Replace logo" : "Upload logo"}
          </button>
          <p className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP or SVG · max 2MB</p>
          {status === "error" && <p className="mt-1 text-xs text-red-600">{msg}</p>}
        </div>
      </div>
    </div>
  );
}

function ReviewReply({ review, subjectType, slug }: { review: OwnedReview; subjectType: string; slug: string }) {
  const [reply, setReply] = useState(review.owner_reply ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function save() {
    setStatus("saving");
    setMsg("");
    try {
      const res = await fetch("/api/owner/review-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_type: subjectType, slug, review_id: review.id, reply }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save.");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e: any) {
      setStatus("error");
      setMsg(e.message);
    }
  }

  return (
    <li className="rounded-lg border border-slate-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-navy">{review.title || review.author}</span>
        <span className="text-amber-500">{"★".repeat(Math.round(review.rating))}</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{review.body}</p>
      <div className="mt-3">
        <label className="label">Your public reply</label>
        <textarea className="input min-h-[70px]" value={reply} placeholder="Thanks for the feedback…" onChange={(e) => setReply(e.target.value)} />
        <div className="mt-2 flex items-center gap-3">
          <button onClick={save} disabled={status === "saving"} className="btn-primary text-sm">{status === "saving" ? "Saving…" : review.owner_reply ? "Update reply" : "Post reply"}</button>
          {status === "saved" && <span className="text-sm font-semibold text-emerald-700">✓ Posted</span>}
          {status === "error" && <span className="text-sm text-red-600">{msg}</span>}
        </div>
      </div>
    </li>
  );
}
