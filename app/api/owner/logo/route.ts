import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminServiceClient } from "@/lib/admin";
import { isProfileOwner } from "@/lib/claims";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" };

/** Owner-gated logo upload (clubs/schools/coaches). Same storage as the admin
 *  uploader, but authorized by profile ownership instead of admin role. */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }
  const file = form.get("file") as File | null;
  const subjectType = String(form.get("subject_type") || "");
  const slug = String(form.get("slug") || "");
  const LOGO_TYPES = ["club", "school", "coach", "training-center", "facility", "tournament", "camp"];
  if (!file || !LOGO_TYPES.includes(subjectType) || !slug) {
    return NextResponse.json({ error: "Missing file, subject_type or slug." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Use PNG, JPG, WEBP or SVG." }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Max file size is 2MB." }, { status: 400 });

  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;
  if (!(await isProfileOwner(subjectType, slug, userId))) {
    return NextResponse.json({ error: "Only the profile owner can change the logo." }, { status: 403 });
  }

  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "Service key not set." }, { status: 503 });

  const path = `${subjectType}/${slug}.${EXT[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const up = await service.storage.from("logos").upload(path, buffer, { contentType: file.type, upsert: true });
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });

  const { data: pub } = service.storage.from("logos").getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`;
  const { error } = await service
    .from("logos")
    .upsert({ subject_type: subjectType, slug, url, updated_at: new Date().toISOString() }, { onConflict: "subject_type,slug" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, url });
}
