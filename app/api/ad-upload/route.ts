import { NextResponse } from "next/server";
import { adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const OK_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

/** Public endpoint: an advertiser uploads banner artwork from the order form.
 *  Stored in the (public) ad-creatives bucket via the service key; returns the
 *  public URL, which the form attaches to the order as creative_url. */
export async function POST(request: Request) {
  const service = adminServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Uploads need Supabase configured." }, { status: 503 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    file = form.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!OK_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use a PNG, JPG, GIF or WEBP image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 400 });
  }

  // Cookieless-safe random name (Math.random is fine here; not a workflow script).
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `orders/${Date.now()}-${rand}.${EXT[file.type] ?? "img"}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await service.storage.from("ad-creatives").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { data } = service.storage.from("ad-creatives").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
