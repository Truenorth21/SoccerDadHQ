"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function UnsubscribeClient() {
  const params = useSearchParams();
  const email = params.get("e") ?? "";
  const token = params.get("t") ?? "";
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("This unsubscribe link is missing information.");
      return;
    }
    fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Could not unsubscribe.");
        setStatus("done");
        setMessage(d.message);
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message);
      });
  }, [email, token]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      {status === "working" && <p className="text-slate-500">Unsubscribing {email}…</p>}
      {status === "done" && (
        <>
          <span className="text-4xl">👋</span>
          <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-navy">Unsubscribed</h1>
          <p className="mt-2 max-w-md text-slate-500">{message}</p>
          <p className="mt-1 text-sm text-slate-400">{email} won&rsquo;t receive The Sideline anymore.</p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="font-heading text-3xl font-bold uppercase text-navy">Hmm.</h1>
          <p className="mt-2 max-w-md text-slate-500">{message}</p>
        </>
      )}
      <Link href="/" className="btn-primary mt-6">Back to SoccerDadHQ</Link>
    </div>
  );
}
