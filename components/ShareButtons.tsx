"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/utils";

/** Share controls for a profile/page. Uses the native share sheet on mobile,
 *  with X / Facebook / WhatsApp / copy-link fallbacks. `path` is the route
 *  (e.g. /clubs/weston-fc); the canonical site URL is prepended. */
export default function ShareButtons({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}${path}`;
  const enc = encodeURIComponent;

  const links = [
    { label: "Share on X", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`, icon: "M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-7-6.1 7H1.7l8-9.2L1 2h7l4.8 6.4L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: "M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z" },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}`, icon: "M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm5.9 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.3.5-.4.4c-.2.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.4.1.6-.1l.8-1c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1z" },
  ];

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    }
  }

  function copy() {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-heading text-xs font-semibold uppercase tracking-wide text-slate-400">Share</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-brand-sky hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d={l.icon} />
          </svg>
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        title="Copy link"
        className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-brand-sky hover:text-white"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.8 10.2a4 4 0 010 5.6l-2.6 2.6a4 4 0 01-5.6-5.6l1.3-1.3m4.3 1.5a4 4 0 010-5.6l2.6-2.6a4 4 0 015.6 5.6l-1.3 1.3" />
          </svg>
        )}
      </button>
      <button
        onClick={nativeShare}
        aria-label="Share"
        title="Share…"
        className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-brand-sky hover:text-white sm:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" />
        </svg>
      </button>
    </div>
  );
}
