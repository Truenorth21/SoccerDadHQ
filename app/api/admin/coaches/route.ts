import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}
function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v ?? "").split(/[;|,]/).map((x) => x.trim()).filter(Boolean);
}

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
  if (!b.name?.trim() || !b.region) {
    return NextResponse.json({ error: "Name and region are required." }, { status: 400 });
  }

  const slug = (b.slug?.trim() || slugify(b.name)).toLowerCase();
  const id = b.id || `co-${slug}`;

  const row = {
    id,
    slug,
    name: b.name.trim(),
    region: b.region,
    city: b.city || null,
    club_name: b.club_name || null,
    title: b.title || null,
    bio: b.bio || null,
    photo_color: b.photo_color || "#1a4fa0",
    certifications: toArr(b.certifications),
    specialties: toArr(b.specialties),
    age_groups: toArr(b.age_groups),
    genders: toArr(b.genders),
    private_training: !!b.private_training,
    private_training_note: b.private_training_note || null,
    email: b.email || null,
    phone: b.phone || null,
    featured: !!b.featured,
  };

  const { error } = await service.from("coaches").upsert(row, { onConflict: "id" });
  if (error) {
    const msg = error.message.includes("coaches_slug_key")
      ? `The slug "${slug}" is already used by another coach.`
      : error.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id, slug });
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
  const { error } = await service.from("coaches").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
