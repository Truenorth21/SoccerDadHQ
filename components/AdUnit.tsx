"use client";

import { useEffect, useRef } from "react";

/** Publisher ID — env override, falling back to the live SoccerDadHQ account. */
const PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-9830230292354443";

export type AdSize = "leaderboard" | "rectangle" | "sidebar";

/** Display box per size; AdSense fills responsively within it. */
const SIZE_STYLE: Record<AdSize, React.CSSProperties> = {
  leaderboard: { display: "block", width: "100%", minHeight: 90 },
  rectangle: { display: "block", width: "100%", maxWidth: 336, minHeight: 280, marginInline: "auto" },
  sidebar: { display: "block", width: "100%", minHeight: 250 },
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** A single Google AdSense unit, driven by an admin-managed slot id. Renders
 *  nothing without a slot id so unconfigured placements stay blank. The loader
 *  script is added once site-wide in the root layout <head>. */
export default function AdUnit({ slotId, size }: { slotId: string; size: AdSize }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slotId || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not ready / blocked — ignore */
    }
  }, [slotId]);

  if (!slotId) return null;

  return (
    <div>
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={SIZE_STYLE[size]}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
