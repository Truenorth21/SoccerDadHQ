import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Extend (or shorten) a profile claim's expiry — promo / referral free months. */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "Service key not set." }, { status: 503 });

  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!b.id) return NextResponse.json({ error: "Missing claim id." }, { status: 400 });
  const addMonths = Number(b.addMonths);
  if (!Number.isFinite(addMonths) || addMonths === 0) {
    return NextResponse.json({ error: "Provide a number of months." }, { status: 400 });
  }

  const { data: claim } = await service.from("profile_claims").select("claimed_until").eq("id", b.id).maybeSingle();
  if (!claim) return NextResponse.json({ error: "Claim not found." }, { status: 404 });

  // Extend from the later of today or the current expiry.
  const now = new Date();
  const base = claim.claimed_until && new Date(`${claim.claimed_until}T00:00:00Z`) > now ? new Date(`${claim.claimed_until}T00:00:00Z`) : now;
  base.setUTCMonth(base.getUTCMonth() + addMonths);
  const until = base.toISOString().slice(0, 10);

  // Reset reminder flags so the extended cycle re-sends its 30/7-day notices.
  const { error } = await service.from("profile_claims").update({ claimed_until: until, reminded_30: false, reminded_7: false }).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, claimed_until: until });
}

/** Revoke a claim. */
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
  const { error } = await service.from("profile_claims").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
