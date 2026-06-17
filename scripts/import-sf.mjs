// One-off: import the prepared South Florida starter data (real clubs + schools)
// into Supabase via the service-role key. Mirrors the column mapping in
// app/api/admin/{clubs,schools}/import/route.ts exactly so the result is
// identical to using the admin CSV importer in the UI.
//
// Run: node scripts/import-sf.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- load .env.local (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) ---
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^"|"$/g, "");
}
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error("Missing Supabase URL / service-role key in .env.local");
const db = createClient(URL, KEY, { auth: { persistSession: false } });

// --- shared helpers (copied verbatim from the import routes) ---
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
const multi = (v) => (v ?? "").split(/[;|]/).map((x) => x.trim()).filter(Boolean);
const bool = (v) => /^(1|true|yes|y|open)$/i.test((v ?? "").trim());
const intOr = (v, d) => (v?.trim() ? Number(v) : d);

function headerIndex(grid) {
  const header = grid[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return (r, col) => { const i = header.indexOf(col); return i === -1 ? "" : (r[i] ?? "").trim(); };
}

async function importClubs() {
  const grid = parseCSV(readFileSync("data/south-florida-clubs.csv", "utf8"));
  const get = headerIndex(grid);
  const rows = [];
  for (let n = 1; n < grid.length; n++) {
    const r = grid[n];
    const name = get(r, "name"), city = get(r, "city"), region = get(r, "region");
    if (!name || !city || !region) continue;
    const slug = get(r, "slug") ? slugify(get(r, "slug")) : slugify(name);
    rows.push({
      id: `c-${slug}`, slug, name, region, city, state: "FL",
      zip: get(r, "zip") || null,
      lat: get(r, "lat") ? Number(get(r, "lat")) : null,
      lng: get(r, "lng") ? Number(get(r, "lng")) : null,
      description: get(r, "description") || null,
      logo_color: get(r, "logo_color") || "#1a4fa0",
      website: get(r, "website") || null,
      email: get(r, "email") || null,
      phone: get(r, "phone") || null,
      leagues: multi(get(r, "leagues")),
      age_groups: multi(get(r, "age_groups")),
      genders: multi(get(r, "genders")),
      tryouts_open: bool(get(r, "tryouts_open")),
      tryout_note: get(r, "tryout_note") || null,
      featured: bool(get(r, "featured")),
    });
  }
  const { error } = await db.from("clubs").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`clubs upsert: ${error.message}`);
  return rows;
}

async function importSchools() {
  const grid = parseCSV(readFileSync("data/south-florida-schools.csv", "utf8"));
  const get = headerIndex(grid);
  const rows = [];
  for (let n = 1; n < grid.length; n++) {
    const r = grid[n];
    const name = get(r, "name"), city = get(r, "city"), region = get(r, "region");
    if (!name || !city || !region) continue;
    const slug = get(r, "slug") ? slugify(get(r, "slug")) : slugify(name);
    rows.push({
      id: `s-${slug}`, slug, name, region, city, state: "FL",
      zip: get(r, "zip") || null,
      lat: get(r, "lat") ? Number(get(r, "lat")) : null,
      lng: get(r, "lng") ? Number(get(r, "lng")) : null,
      type: get(r, "type") === "Private" ? "Private" : "Public",
      fhsaa_class: get(r, "fhsaa_class") || null,
      district: get(r, "district") || null,
      mascot: get(r, "mascot") || null,
      colors: multi(get(r, "colors")),
      logo_color: get(r, "logo_color") || "#1a4fa0",
      programs: multi(get(r, "programs")),
      head_coach_boys: get(r, "head_coach_boys") || null,
      head_coach_girls: get(r, "head_coach_girls") || null,
      state_titles: intOr(get(r, "state_titles"), 0),
      last_title: intOr(get(r, "last_title"), null),
      district_titles: intOr(get(r, "district_titles"), 0),
      enrollment: intOr(get(r, "enrollment"), 0),
      description: get(r, "description") || null,
      website: get(r, "website") || null,
      featured: bool(get(r, "featured")),
    });
  }
  const { error } = await db.from("schools").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`schools upsert: ${error.message}`);
  return rows;
}

const clubs = await importClubs();
const schools = await importSchools();
console.log(`✓ Imported ${clubs.length} clubs:`, clubs.map((c) => c.name).join(", "));
console.log(`✓ Imported ${schools.length} schools:`, schools.map((s) => s.name).join(", "));
console.log(`  Spotlight (featured) clubs: ${clubs.filter((c) => c.featured).map((c) => c.name).join(", ") || "none"}`);
console.log(`  Spotlight (featured) schools: ${schools.filter((s) => s.featured).map((s) => s.name).join(", ") || "none"}`);
