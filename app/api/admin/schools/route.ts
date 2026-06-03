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
const num = (v: unknown): number | null => (v !== undefined && v !== "" && v !== null ? Number(v) : null);

/** Create or update a real high school (admin only). */
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
  if (!b.name?.trim() || !b.region || !b.city?.trim()) {
    return NextResponse.json({ error: "Name, region and city are required." }, { status: 400 });
  }

  const slug = (b.slug?.trim() || slugify(b.name)).toLowerCase();
  const id = b.id || `s-${slug}`;

  const row = {
    id,
    slug,
    name: b.name.trim(),
    region: b.region,
    city: b.city.trim(),
    state: "FL",
    zip: b.zip || null,
    lat: num(b.lat),
    lng: num(b.lng),
    type: b.type === "Private" ? "Private" : "Public",
    fhsaa_class: b.fhsaa_class || null,
    district: b.district || null,
    mascot: b.mascot || null,
    colors: toArr(b.colors),
    logo_color: b.logo_color || "#1a4fa0",
    programs: toArr(b.programs),
    head_coach_boys: b.head_coach_boys || null,
    head_coach_girls: b.head_coach_girls || null,
    state_titles: num(b.state_titles) ?? 0,
    last_title: num(b.last_title),
    district_titles: num(b.district_titles) ?? 0,
    enrollment: num(b.enrollment) ?? 0,
    description: b.description || null,
    website: b.website || null,
    featured: !!b.featured,
  };

  const { error } = await service.from("schools").upsert(row, { onConflict: "id" });
  if (error) {
    const msg = error.message.includes("schools_slug_key")
      ? `The slug "${slug}" is already used by another school.`
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
  const { error } = await service.from("schools").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
