import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";
import { REGIONS } from "@/lib/regions";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
const multi = (v: string) => (v ?? "").split(/[;|]/).map((x) => x.trim()).filter(Boolean);
const bool = (v: string) => /^(1|true|yes|y)$/i.test((v ?? "").trim());

const regionByKey = new Set<string>(REGIONS.map((r) => r.key));
const regionByName = new Map<string, string>(REGIONS.map((r) => [r.name.toLowerCase(), r.key]));
function resolveRegion(v: string): string | null {
  const t = (v ?? "").trim();
  if (regionByKey.has(t)) return t;
  return regionByName.get(t.toLowerCase()) ?? null;
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 503 });

  let csv: string;
  try {
    csv = (await request.json()).csv ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const grid = parseCSV(csv);
  if (grid.length < 2) return NextResponse.json({ error: "Need a header row plus at least one coach row." }, { status: 400 });

  const header = grid[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const idx = (n: string) => header.indexOf(n);
  if (idx("name") === -1 || idx("region") === -1) {
    return NextResponse.json({ error: "CSV must include at least: name, region columns." }, { status: 400 });
  }
  const get = (r: string[], c: string) => {
    const i = idx(c);
    return i === -1 ? "" : (r[i] ?? "").trim();
  };

  const errors: string[] = [];
  const byId = new Map<string, Record<string, any>>();
  for (let n = 1; n < grid.length; n++) {
    const r = grid[n];
    const name = get(r, "name");
    const regionRaw = get(r, "region");
    if (!name || !regionRaw) {
      errors.push(`Row ${n + 1}: missing name/region — skipped.`);
      continue;
    }
    const region = resolveRegion(regionRaw);
    if (!region) {
      errors.push(`Row ${n + 1} ("${name}"): unknown region "${regionRaw}" — skipped.`);
      continue;
    }
    const slug = get(r, "slug") ? slugify(get(r, "slug")) : slugify(name);
    const id = `co-${slug}`;
    byId.set(id, {
      id, slug, name, region,
      city: get(r, "city") || null,
      club_name: get(r, "club_name") || null,
      title: get(r, "title") || null,
      bio: get(r, "bio") || null,
      photo_color: get(r, "photo_color") || "#1a4fa0",
      certifications: multi(get(r, "certifications")),
      specialties: multi(get(r, "specialties")),
      age_groups: multi(get(r, "age_groups")),
      genders: multi(get(r, "genders")),
      private_training: bool(get(r, "private_training")),
      private_training_note: get(r, "private_training_note") || null,
      email: get(r, "email") || null,
      phone: get(r, "phone") || null,
      featured: bool(get(r, "featured")),
    });
  }

  const rows = Array.from(byId.values());
  if (rows.length === 0) return NextResponse.json({ error: "No valid rows to import.", errors }, { status: 400 });

  const { error } = await service.from("coaches").upsert(rows, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message, errors }, { status: 500 });
  return NextResponse.json({ ok: true, imported: rows.length, skipped: errors.length, errors });
}
