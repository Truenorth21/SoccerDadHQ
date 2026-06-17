import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** A profile owner marks one of their inbound messages read. Verifies the signed-in
 *  user actually owns the message's profile (via profile_claims) before updating. */
export async function POST(request: Request) {
  const supabase = createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ ok: false });

  let id: string | undefined;
  try {
    id = (await request.json()).id;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { data: msg } = await service.from("profile_messages").select("subject_type,subject_slug").eq("id", id).maybeSingle();
  if (!msg) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: claim } = await service
    .from("profile_claims")
    .select("owner_id")
    .eq("subject_type", msg.subject_type)
    .eq("subject_slug", msg.subject_slug)
    .maybeSingle();
  if (!claim || claim.owner_id !== user.id) {
    return NextResponse.json({ error: "Not your profile." }, { status: 403 });
  }

  await service.from("profile_messages").update({ read: true }).eq("id", id);
  return NextResponse.json({ ok: true });
}
