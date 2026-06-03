"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Admin-only logo uploader. Self-gates on the client so the profile page can
 *  stay statically generated. Renders nothing for non-admins / demo mode. */
export default function LogoManager({
  subjectType,
  slug,
  currentLogo,
}: {
  subjectType: "club" | "school" | "coach";
  slug: string;
  currentLogo: string | null;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [url, setUrl] = useState<string | null>(currentLogo);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: p }) => setIsAdmin((p as { role?: string } | null)?.role === "admin"));
    });
  }, []);

  if (!isAdmin) return null;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("subject_type", subjectType);
      form.append("slug", slug);
      const res = await fetch("/api/admin/logo", { method: "POST", body: form });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed");
      setUrl(d.url);
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div className="card border-2 border-dashed border-brand-sky/40 p-4">
      <h3 className="mb-2 font-heading text-sm font-bold uppercase text-brand-blue">⚙ Logo (admin)</h3>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Current logo" className="h-14 w-14 rounded-lg object-contain ring-1 ring-slate-200" />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">none</span>
        )}
        <div className="flex-1">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={status === "uploading"} className="btn-outline text-sm">
            {status === "uploading" ? "Uploading…" : url ? "Replace logo" : "Upload logo"}
          </button>
          <p className="mt-1 text-xs text-slate-400">PNG/JPG/WEBP/SVG · max 2MB</p>
        </div>
      </div>
      {status === "error" && <p className="mt-2 text-sm text-red-600">{message}</p>}
    </div>
  );
}
