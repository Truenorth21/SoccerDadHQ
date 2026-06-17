import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminServiceClient } from "@/lib/admin";
import { isProfileOwner } from "@/lib/claims";
import { OVERRIDE_FIELDS } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Owner-gated profile field edits. Saves a whitelisted subset to
 *  profile_overrides (merged onto the entity at read time). */
export async function POST(request: Request) {
  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const subjectType = String(b.subject_type || "");
  const slug = String(b.slug || "");
  const fields = (b.fields ?? {}) as Record<string, unknown>;
  const allow = OVERRIDE_FIELDS[subjectType];
  if (!allow || !slug) return NextResponse.json({ error: "Unknown profile." }, { status: 400 });

  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;
  if (!(await isProfileOwner(subjectType, slug, userId))) {
    return NextResponse.json({ error: "Only the profile owner can edit this." }, { status: 403 });
  }

  const svc = adminServiceClient();
  if (!svc) return NextResponse.json({ error: "Service key not set." }, { status: 503 });

  // Whitelist + merge onto any existing override so partial saves don't wipe fields.
  const patch: Record<string, unknown> = {};
  for (const k of allow) if (k in fields) patch[k] = fields[k];
  const { data: existing } = await svc.from("profile_overrides").select("data").eq("subject_type", subjectType).eq("slug", slug).maybeSingle();
  const merged = { ...(((existing as { data?: Record<string, unknown> } | null)?.data) ?? {}), ...patch };

  const { error } = await svc
    .from("profile_overrides")
    .upsert({ subject_type: subjectType, slug, data: merged, updated_at: new Date().toISOString() }, { onConflict: "subject_type,slug" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
