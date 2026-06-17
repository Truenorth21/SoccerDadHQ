import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Add a marketing campaign (spend entry, attributed by utm_campaign). */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 503 });

  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!b.name?.trim()) return NextResponse.json({ error: "Name your campaign." }, { status: 400 });

  const { error } = await service.from("marketing_campaigns").insert({
    name: b.name.trim(),
    channel: b.channel?.trim() || null,
    utm_campaign: b.utm_campaign?.trim() || null,
    spend: Number(b.spend) || 0,
    start_date: b.start_date || null,
    end_date: b.end_date || null,
    notes: b.notes?.trim() || null,
  });
  if (error) {
    if (error.message?.includes("does not exist") || (error as { code?: string }).code === "42P01") {
      return NextResponse.json({ error: "The marketing tables don't exist yet — run the migration." }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "Service key not set." }, { status: 503 });

  let id: string | undefined;
  try {
    id = (await request.json()).id;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await service.from("marketing_campaigns").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
