import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Fire-and-forget impression/click logging from AdSlot (sendBeacon). */
export async function POST(request: Request) {
  let body: { ad_id?: string; placement?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.ad_id || (body.type !== "impression" && body.type !== "click")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) return NextResponse.json({ ok: true, demo: true });

  await supabase.from("ad_events").insert({
    ad_id: body.ad_id,
    placement: body.placement ?? null,
    type: body.type,
  });
  return NextResponse.json({ ok: true });
}
