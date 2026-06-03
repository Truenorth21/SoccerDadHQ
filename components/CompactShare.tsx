"use client";

import { useState } from "react";

/** One-tap share icon: native share sheet when available, else copy-to-clipboard.
 *  Works for external URLs (e.g. news articles). Safe to place over a card link. */
export default function CompactShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled — fall through to copy */
      }
    }
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={share}
      aria-label={`Share: ${title}`}
      title="Share"
      className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:bg-brand-sky hover:text-white"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" />
        </svg>
      )}
    </button>
  );
}
