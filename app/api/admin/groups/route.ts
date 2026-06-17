import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Manage user groups: create a group, add/remove members (by email), delete a group. */
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

  if (b.action === "create-group") {
    const name = String(b.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Name the group." }, { status: 400 });
    const { error } = await service.from("user_groups").insert({ name });
    if (error) {
      if (error.message?.includes("does not exist")) return NextResponse.json({ error: "Run the messaging migration first." }, { status: 503 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (b.action === "add-member") {
    const email = String(b.email ?? "").trim().toLowerCase();
    if (!b.group_id || !email) return NextResponse.json({ error: "Group and email required." }, { status: 400 });
    const { data: prof } = await service.from("profiles").select("id").ilike("email", email).maybeSingle();
    if (!prof) return NextResponse.json({ error: `No registered user with email ${email}.` }, { status: 400 });
    const { error } = await service.from("user_group_members").upsert({ group_id: b.group_id, user_id: prof.id }, { onConflict: "group_id,user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (b.action === "remove-member") {
    if (!b.group_id || !b.user_id) return NextResponse.json({ error: "Missing ids." }, { status: 400 });
    const { error } = await service.from("user_group_members").delete().eq("group_id", b.group_id).eq("user_id", b.user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
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
  if (!id) return NextResponse.json({ error: "Missing group id." }, { status: 400 });
  const { error } = await service.from("user_groups").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
