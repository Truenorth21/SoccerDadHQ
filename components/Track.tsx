"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SID = "sdhq:sid";
const UTM = "sdhq:utm";

/** Fires a first-party pageview on every route change. Captures UTM tags on the
 *  landing page and remembers them for the session, so all pages in a campaign
 *  visit are attributed to it. Geo (city/state) is added server-side from headers. */
export default function Track() {
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    let sid: string | null = null;
    try {
      sid = localStorage.getItem(SID);
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(SID, sid);
      }
    } catch {
      /* ignore */
    }

    // First-touch UTM: use the current URL's tags if present, else the session's.
    const cur = {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
    };
    let utm = cur;
    try {
      if (cur.source || cur.campaign || cur.medium) {
        sessionStorage.setItem(UTM, JSON.stringify(cur));
      } else {
        const saved = JSON.parse(sessionStorage.getItem(UTM) || "null");
        if (saved) utm = saved;
      }
    } catch {
      /* ignore */
    }

    const body = JSON.stringify({
      session_id: sid,
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
      }
    } catch {
      /* ignore */
    }
  }, [pathname, params]);

  return null;
}
