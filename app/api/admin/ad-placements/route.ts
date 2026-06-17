import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

const SIZES = new Set(["leaderboard", "rectangle", "sidebar"]);

/** Upsert one AdSense placement row (keyed by slot). Admin-only; writes with
 *  the service-role key so they bypass RLS. */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 503 });

  let body: {
    slot?: unknown;
    location?: unknown;
    size?: unknown;
    adsense_slot_id?: unknown;
    enabled?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const slot = typeof body.slot === "string" ? body.slot.trim() : "";
  if (!slot) return NextResponse.json({ error: "Missing slot." }, { status: 400 });

  const row = {
    slot,
    location: typeof body.location === "string" ? body.location : "",
    size: typeof body.size === "string" && SIZES.has(body.size) ? body.size : "leaderboard",
    adsense_slot_id: typeof body.adsense_slot_id === "string" ? body.adsense_slot_id.trim() : "",
    enabled: Boolean(body.enabled),
    updated_at: new Date().toISOString(),
  };

  const { error } = await service.from("ad_placements").upsert(row, { onConflict: "slot" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, message: "Saved. Live within ~60s." });
}
