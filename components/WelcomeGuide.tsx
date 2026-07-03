"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "sdhq:welcome-guide-seen";

function track(event: string) {
  const win = window as typeof window & {
    plausible?: (name: string) => void;
    gtag?: (...args: unknown[]) => void;
  };
  win.plausible?.(event);
  win.gtag?.("event", event);
}

export default function WelcomeGuide() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        return;
      }
      setOpen(true);
      track("welcome_guide_view");
    }, 10_000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <aside
      aria-labelledby="welcome-guide-title"
      className="fixed bottom-4 left-4 right-4 z-[60] overflow-hidden rounded-2xl border border-white/15 bg-navy text-white shadow-2xl sm:left-auto sm:right-6 sm:w-[390px]"
    >
      <div className="h-1.5 bg-gradient-to-r from-brand-amber to-brand-sky" />
      <div className="relative p-6">
        <button
          ref={closeRef}
          type="button"
          onClick={() => {
            setOpen(false);
            track("welcome_guide_dismiss");
          }}
          aria-label="Close welcome guide"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-amber"
        >
          ×
        </button>

        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-brand-amber">
          New here?
        </p>
        <h2 id="welcome-guide-title" className="mt-1 pr-8 font-heading text-2xl font-bold uppercase">
          Find your soccer fit
        </h2>
        <ol className="mt-4 space-y-2 text-sm text-slate-200">
          <li><strong className="text-white">1.</strong> Search clubs, schools and coaches near you.</li>
          <li><strong className="text-white">2.</strong> Compare profiles, rankings and parent reviews.</li>
          <li><strong className="text-white">3.</strong> Join free to save favorites, vote and write reviews.</li>
        </ol>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login?next=/dashboard"
            onClick={() => track("welcome_guide_join_click")}
            className="btn-amber flex-1 text-center text-sm"
          >
            Join free
          </Link>
          <Link
            href="/clubs"
            onClick={() => track("welcome_guide_browse_click")}
            className="flex-1 rounded-lg border border-white/25 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/10"
          >
            Browse clubs
          </Link>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">Browsing is always free. No account required.</p>
      </div>
    </aside>
  );
}
