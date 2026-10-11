import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** First-party pageview beacon. Records the visit + UTM tags from the body, plus
 *  the visitor's city/region/country from Cloudflare's request geo data (no IP stored,
 *  no third-party service). Fire-and-forget; never throws to the client. */
export async function POST(request: Request) {
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ ok: false });

  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ ok: false });
  }

  const h = request.headers;
  const dec = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  const str = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : null);

  // Cloudflare attaches approximate geo to every request (request.cf).
  let cf: { city?: string; regionCode?: string; country?: string } = {};
  try {
    cf = (getCloudflareContext().cf as typeof cf) ?? {};
  } catch {
    /* not running on Cloudflare (local dev) */
  }

  try {
    await service.from("visits").insert({
      session_id: str(b.session_id, 40),
      path: str(b.path, 300),
      referrer: str(b.referrer, 400),
      utm_source: str(b.utm_source, 100),
      utm_medium: str(b.utm_medium, 100),
      utm_campaign: str(b.utm_campaign, 100),
      city: cf.city ?? dec(h.get("x-vercel-ip-city")),
      region: cf.regionCode ?? dec(h.get("x-vercel-ip-country-region")),
      country: cf.country ?? h.get("x-vercel-ip-country"),
    });
  } catch {
    /* table may not exist yet — ignore */
  }
  return NextResponse.json({ ok: true });
}
