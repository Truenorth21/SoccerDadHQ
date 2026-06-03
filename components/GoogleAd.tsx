"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** A single Google AdSense responsive unit. The library script is loaded once
 *  site-wide in <Analytics> when NEXT_PUBLIC_ADSENSE_CLIENT is set. */
export default function GoogleAd({ client, slot }: { client: string; slot: string }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not ready / blocked — ignore */
    }
  }, []);

  return (
    <div>
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
