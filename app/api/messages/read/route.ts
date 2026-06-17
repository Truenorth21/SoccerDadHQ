import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Mark a message read for the signed-in user. Identity comes from their session;
 *  the write uses the service key (the table is admin/service-only). */
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
  if (!id) return NextResponse.json({ error: "Missing message id." }, { status: 400 });

  await service.from("message_reads").upsert({ message_id: id, user_id: user.id }, { onConflict: "message_id,user_id" });
  return NextResponse.json({ ok: true });
}
