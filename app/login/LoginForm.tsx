"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "check-email">("idle");
  const [message, setMessage] = useState("");

  const supabase = createClient();
  const explicitNext = params.get("next");
  const next = explicitNext || "/dashboard";

  async function emailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus("error");
      setMessage("Auth is in demo mode. Add your Supabase keys to .env.local to enable real accounts.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setStatus("check-email");
        setMessage("Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // With no explicit destination, send admins straight to the moderation
        // dashboard instead of the member dashboard.
        let dest = next;
        if (!explicitNext) {
          const { data: u } = await supabase.auth.getUser();
          if (u.user) {
            const { data: p } = await supabase.from("profiles").select("role").eq("id", u.user.id).single();
            if ((p as { role?: string } | null)?.role === "admin") dest = "/admin";
          }
        }
        router.push(dest);
        router.refresh();
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "Authentication failed.");
    }
  }

  async function googleAuth() {
    if (!supabase) {
      setStatus("error");
      setMessage("Google sign-in requires Supabase to be configured.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <div className="card w-full max-w-md p-7">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-navy">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "signup"
          ? "Join free to review clubs, vote in rankings and save favorites."
          : "Log in to write reviews, vote and manage your dashboard."}
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
          Demo mode: add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to enable real login.
        </div>
      )}

      {/* Google sign-in only shows when NEXT_PUBLIC_GOOGLE_AUTH=true (and the
          provider is configured in Supabase). Hidden by default. */}
      {process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true" && (
        <>
          <button
            onClick={googleAuth}
            className="btn-outline mt-5 w-full"
            type="button"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
              <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 002.18 7.06l3.66 2.84C6.71 7.3 9.14 4.75 12 4.75z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      <form onSubmit={emailAuth} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {status === "error" && <p className="text-sm text-red-600">{message}</p>}
        {status === "check-email" && <p className="text-sm text-emerald-700">{message}</p>}

        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? "…" : mode === "signup" ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        {mode === "signup" ? "Already have an account?" : "New to SoccerDadHQ?"}{" "}
        <button
          onClick={() => {
            setMode((m) => (m === "signup" ? "login" : "signup"));
            setStatus("idle");
          }}
          className="font-semibold text-brand-blue hover:underline"
        >
          {mode === "signup" ? "Log in" : "Create one"}
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-slate-400">
        <Link href="/" className="hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}
