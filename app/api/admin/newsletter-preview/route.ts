import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { buildRegionDigest } from "@/lib/digestEmail";
import { UNSUB_PLACEHOLDER } from "@/lib/unsubscribe";
import { stateByCode } from "@/lib/states";

export const dynamic = "force-dynamic";

/** Admin-only: the exact HTML a state (or one of its regions) would receive.
 *  Nothing is sent. `?format=json` returns the subject alongside the HTML. */
export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const state = stateByCode(searchParams.get("state"))?.code;
  if (!state) return NextResponse.json({ error: "Pick a state." }, { status: 400 });
  const region = searchParams.get("region") || null;

  try {
    const digest = await buildRegionDigest(region, state);
    const html = digest.html.split(UNSUB_PLACEHOLDER).join("#");
    if (searchParams.get("format") === "json") {
      return NextResponse.json({ subject: digest.subject, label: digest.label });
    }
    return new NextResponse(`<!doctype html><html><head><meta charset="utf-8"><title>${digest.subject.replace(/</g, "&lt;")}</title></head><body style="margin:0;padding:16px;background:#f8fafc">${html}</body></html>`, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: `Build failed: ${e?.message ?? "unknown error"}` }, { status: 500 });
  }
}
