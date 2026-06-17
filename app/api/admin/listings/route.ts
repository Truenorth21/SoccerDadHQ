import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

const KINDS = ["training-center", "facility", "tournament", "camp"];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}

/** Create or update a real training-center / facility / tournament / camp (admin only). */
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

  if (!KINDS.includes(b.kind)) {
    return NextResponse.json({ error: "Pick a valid listing type." }, { status: 400 });
  }
  if (!b.name?.trim() || !b.region || !b.city?.trim()) {
    return NextResponse.json({ error: "Name, region and city are required." }, { status: 400 });
  }

  const slug = (b.slug?.trim() || slugify(b.name)).toLowerCase();
  const id = b.id || `${b.kind}-${slug}`;

  const row = {
    id,
    slug,
    kind: b.kind,
    name: b.name.trim(),
    region: b.region,
    city: b.city.trim(),
    zip: b.zip || null,
    lat: b.lat !== undefined && b.lat !== "" && b.lat !== null ? Number(b.lat) : null,
    lng: b.lng !== undefined && b.lng !== "" && b.lng !== null ? Number(b.lng) : null,
    description: b.description || null,
    website: b.website || null,
    email: b.email || null,
    phone: b.phone || null,
    color: b.color || "#1a4fa0",
    tags: toArr(b.tags),
    featured: !!b.featured,
    verified: !!b.verified,
  };

  const { error } = await service.from("listings").upsert(row, { onConflict: "id" });
  if (error) {
    if (error.message?.includes("does not exist") || (error as any).code === "42P01") {
      return NextResponse.json({ error: "The listings table doesn't exist yet — run the listings migration in Supabase." }, { status: 503 });
    }
    const msg = error.message.includes("listings_kind_slug_key") || (error as any).code === "23505"
      ? `The slug "${slug}" is already used by another ${b.kind}.`
      : error.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id, slug });
}

/** Remove a real listing (admin only). */
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

  const { error } = await service.from("listings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
