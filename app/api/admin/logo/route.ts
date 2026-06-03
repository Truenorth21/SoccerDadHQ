import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 503 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("file") as File | null;
  const subjectType = String(form.get("subject_type") || "");
  const slug = String(form.get("slug") || "");

  if (!file || !["club", "school", "coach"].includes(subjectType) || !slug) {
    return NextResponse.json({ error: "Missing file, subject_type or slug." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Use PNG, JPG, WEBP or SVG." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 2MB." }, { status: 400 });
  }

  const path = `${subjectType}/${slug}.${EXT[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const up = await service.storage.from("logos").upload(path, buffer, { contentType: file.type, upsert: true });
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });

  const { data: pub } = service.storage.from("logos").getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust on re-upload

  const { error } = await service
    .from("logos")
    .upsert({ subject_type: subjectType, slug, url, updated_at: new Date().toISOString() }, { onConflict: "subject_type,slug" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, url });
}
