"use client";

import { useEffect, useRef } from "react";
import { resolveAd, type AdPlacement } from "@/lib/ads";
import { useAdsConfig } from "./AdsProvider";
import GoogleAd from "./GoogleAd";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

function logAdEvent(ad_id: string, placement: string, type: "impression" | "click") {
  try {
    const payload = JSON.stringify({ ad_id, placement, type });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/ad-events", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/ad-events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
    }
  } catch {
    /* logging is best-effort */
  }
}

/** Fires one impression when the ad scrolls into view, plus a click handler. */
function useAdTracking(adId: string, placement: AdPlacement) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const seen = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !seen.current) {
          seen.current = true;
          logAdEvent(adId, placement, "impression");
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [adId, placement]);
  const onClick = () => logAdEvent(adId, placement, "click");
  return { ref, onClick };
}

/** Renders an ad unit for a placement. Variants:
 *  - banner: wide horizontal (homepage / leaderboard)
 *  - sidebar: vertical card (directory / profile / rankings sidebars)
 *  - infeed: matches the news card grid
 *  Every unit is clearly labeled per ad-disclosure best practice. */
export default function AdSlot({
  placement,
  variant = "sidebar",
  seed = 0,
}: {
  placement: AdPlacement;
  variant?: "banner" | "sidebar" | "infeed" | "leaderboard";
  seed?: number;
}) {
  const ads = useAdsConfig();
  const ad = resolveAd(ads, placement, seed);
  const label = ad.affiliate ? "Affiliate" : ad.house ? "Promoted" : "Sponsored";
  const { ref, onClick } = useAdTracking(ad.id, placement);

  // Waterfall: an unsold (house) slot is filled by Google AdSense when configured.
  if (ad.house && ADSENSE_CLIENT && ADSENSE_SLOT) {
    return <GoogleAd client={ADSENSE_CLIENT} slot={ADSENSE_SLOT} />;
  }

  // Standard top-of-page leaderboard — clearly marked, hard to miss.
  if (variant === "leaderboard") {
    return (
      <div>
        <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Advertisement
        </p>
        <a
          ref={ref}
          onClick={onClick}
          href={ad.href}
          className="group flex items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-card sm:p-4"
        >
          {ad.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-lg font-heading text-lg font-bold text-white"
              style={{ backgroundColor: ad.color }}
              aria-hidden
            >
              {ad.advertiser.slice(0, 1)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {label} · {ad.advertiser}
            </span>
            <p className="mt-0.5 truncate font-heading text-base font-bold text-navy group-hover:text-brand-sky sm:text-lg">
              {ad.headline}
            </p>
            <p className="hidden truncate text-sm text-slate-500 sm:block">{ad.body}</p>
          </div>
          <span className="hidden shrink-0 rounded-lg bg-brand-amber px-4 py-2 font-heading text-sm font-semibold uppercase text-navy sm:inline-block">
            {ad.cta}
          </span>
        </a>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <a
        ref={ref}
        onClick={onClick}
        href={ad.href}
        className="group relative block overflow-hidden rounded-2xl p-6 text-white sm:p-8"
        style={{ backgroundImage: `linear-gradient(120deg, ${ad.color}, #0a1628)` }}
      >
        <span className="absolute right-3 top-3 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
        <div className="max-w-2xl">
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-white/70">{ad.advertiser}</p>
          <h3 className="mt-1 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">{ad.headline}</h3>
          <p className="mt-2 text-sm text-white/85">{ad.body}</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand-amber px-4 py-2 font-heading text-sm font-semibold uppercase text-navy">
            {ad.cta} →
          </span>
        </div>
      </a>
    );
  }

  if (variant === "infeed") {
    return (
      <a ref={ref} onClick={onClick} href={ad.href} className="card card-hover group flex flex-col p-5 ring-1 ring-amber-100">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
            {label}
          </span>
          <span className="text-xs text-slate-400">{ad.advertiser}</span>
        </div>
        <h3 className="font-heading text-lg font-bold leading-snug text-navy group-hover:text-brand-sky">{ad.headline}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{ad.body}</p>
        <span className="mt-4 border-t border-slate-100 pt-3 font-heading text-sm font-semibold uppercase text-brand-blue">{ad.cta} →</span>
      </a>
    );
  }

  // sidebar
  return (
    <a ref={ref} onClick={onClick} href={ad.href} className="card card-hover group block overflow-hidden">
      {ad.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.image} alt="" className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="h-1.5 w-full" style={{ backgroundColor: ad.color }} />
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
          <span className="text-[10px] text-slate-400">{ad.advertiser}</span>
        </div>
        <h3 className="font-heading text-base font-bold leading-tight text-navy group-hover:text-brand-sky">{ad.headline}</h3>
        <p className="mt-1 text-sm text-slate-600">{ad.body}</p>
        <span className="mt-3 inline-block font-heading text-sm font-semibold uppercase text-brand-blue">{ad.cta} →</span>
      </div>
    </a>
  );
}
