/**
 * Generates supabase/seed.sql from the canonical seed data in lib/seed.ts
 * so the database seed always matches what the app ships with.
 *
 *   npx tsx scripts/gen-seed-sql.ts              → supabase/seed.sql (everything)
 *   npx tsx scripts/gen-seed-sql.ts --national   → supabase/national-clubs-seed.sql
 *                                                  (non-Florida clubs + coaches only, for
 *                                                  databases that already hold the Florida seed)
 *   npx tsx scripts/gen-seed-sql.ts --national --states CA,NY
 *                                                → supabase/national-clubs-seed-ca-ny.sql
 *                                                  (just those states' clubs + coaches, for
 *                                                  databases that already hold earlier states)
 *   npx tsx scripts/gen-seed-sql.ts --schools --states TX,GA
 *                                                → supabase/national-schools-seed-tx-ga.sql
 *                                                  (just those states' high schools)
 */
import { writeFileSync } from "node:fs";
import { CLUBS, COACHES, TRYOUTS } from "../lib/seed";
import { SCHOOLS } from "../lib/schools";

function s(v: string | null | undefined): string {
  if (v === null || v === undefined) return "null";
  return `'${String(v).replace(/'/g, "''")}'`;
}
function arr(a: string[]): string {
  return `ARRAY[${a.map((x) => s(x)).join(",")}]::text[]`;
}
function b(v: boolean): string {
  return v ? "true" : "false";
}
function n(v: number | undefined): string {
  return v === undefined ? "null" : String(v);
}

const national = process.argv.includes("--national");
const statesArg = process.argv[process.argv.indexOf("--states") + 1];
const onlyStates = process.argv.includes("--states") && statesArg ? statesArg.toUpperCase().split(",") : null;
const inScope = (state: string) => (onlyStates ? onlyStates.includes(state) : state !== "FL");
const clubs = national ? CLUBS.filter((c) => inScope(c.state)) : CLUBS;
const coaches = national ? COACHES.filter((c) => inScope(c.state)) : COACHES;
const nationalFile = onlyStates
  ? `national-clubs-seed-${onlyStates.map((x) => x.toLowerCase()).join("-")}.sql`
  : "national-clubs-seed.sql";
// The national file skips rows that collide on id OR slug (e.g. a club an admin
// already imported by CSV), so it never overwrites live data.
const onConflict = national ? "on conflict do nothing" : "on conflict (id) do nothing";

const lines: string[] = [];

function schoolInsert(sc: (typeof SCHOOLS)[number], conflict: string): string {
  return (
    `insert into public.schools (id, slug, name, region, city, state, zip, lat, lng, type, fhsaa_class, district, mascot, colors, logo_color, programs, head_coach_boys, head_coach_girls, state_titles, last_title, district_titles, enrollment, description, website, featured, plan) values (` +
    [
      s(sc.id), s(sc.slug), s(sc.name), s(sc.region), s(sc.city), s(sc.state), s(sc.zip),
      n(sc.lat), n(sc.lng), s(sc.type), s(sc.fhsaa_class || null), s(sc.district || null), s(sc.mascot || null),
      arr(sc.colors), s(sc.logo_color), arr(sc.programs), s(sc.head_coach_boys), s(sc.head_coach_girls),
      n(sc.state_titles), n(sc.last_title), n(sc.district_titles), sc.enrollment ? n(sc.enrollment) : "null", s(sc.description), s(sc.website),
      b(sc.featured), s(sc.plan),
    ].join(", ") +
    `) ${conflict};`
  );
}

if (process.argv.includes("--schools")) {
  const schools = SCHOOLS.filter((sc) => inScope(sc.state));
  const file = onlyStates
    ? `national-schools-seed-${onlyStates.map((x) => x.toLowerCase()).join("-")}.sql`
    : "national-schools-seed.sql";
  lines.push("-- ============================================================");
  lines.push("--  SoccerDadHQ — national high schools seed (generated from lib/schoolsNational.ts)");
  if (onlyStates) lines.push(`--  States: ${onlyStates.join(", ")}`);
  lines.push("--  Run AFTER national-schools-listings-migration.sql. Safe to re-run:");
  lines.push("--  rows that already exist (same id or slug) are skipped, never overwritten.");
  lines.push("-- ============================================================");
  lines.push("");
  for (const sc of schools) lines.push(schoolInsert(sc, "on conflict do nothing"));
  writeFileSync(new URL(`../supabase/${file}`, import.meta.url), lines.join("\n") + "\n");
  console.log(`Wrote supabase/${file} — ${schools.length} schools.`);
  process.exit(0);
}
lines.push("-- ============================================================");
if (national) {
  lines.push("--  SoccerDadHQ — national expansion seed (generated from lib/seedNational.ts)");
  if (onlyStates) lines.push(`--  States: ${onlyStates.join(", ")}`);
  lines.push("--  Run AFTER national-expansion-migration.sql. Safe to re-run.");
} else {
  lines.push("--  SoccerDadHQ — seed data (generated from lib/seed.ts)");
  lines.push("--  Run AFTER schema.sql.");
}
lines.push("-- ============================================================");
lines.push("");

// Clubs
lines.push("-- Clubs --------------------------------------------------------");
for (const c of clubs) {
  lines.push(
    `insert into public.clubs (id, slug, name, region, city, state, zip, lat, lng, founded, description, logo_color, website, email, phone, instagram, facebook, twitter, leagues, age_groups, genders, tryouts_open, tryout_note, claimed, verified, featured, plan) values (` +
      [
        s(c.id), s(c.slug), s(c.name), s(c.region), s(c.city), s(c.state), s(c.zip),
        n(c.lat), n(c.lng), n(c.founded), s(c.description), s(c.logo_color), s(c.website),
        s(c.email), s(c.phone), s(c.instagram), s(c.facebook), s(c.twitter),
        arr(c.leagues), arr(c.age_groups), arr(c.genders), b(c.tryouts_open),
        s(c.tryout_note), b(c.claimed), b(c.verified), b(c.featured), s(c.plan),
      ].join(", ") +
      `) ${onConflict};`
  );
}
lines.push("");

// Coaches
lines.push("-- Coaches ------------------------------------------------------");
for (const c of coaches) {
  lines.push(
    `insert into public.coaches (id, slug, name, region, city, state, club_id, club_name, title, bio, photo_color, certifications, specialties, age_groups, genders, private_training, private_training_note, email, phone, featured, plan) values (` +
      [
        s(c.id), s(c.slug), s(c.name), s(c.region), s(c.city), s(c.state), s(c.club_id ?? null),
        s(c.club_name), s(c.title), s(c.bio), s(c.photo_color), arr(c.certifications),
        arr(c.specialties), arr(c.age_groups), arr(c.genders), b(c.private_training),
        s(c.private_training_note), s(c.email), s(c.phone), b(c.featured), s(c.plan),
      ].join(", ") +
      `) ${onConflict};`
  );
}
lines.push("");

if (national) {
  writeFileSync(new URL(`../supabase/${nationalFile}`, import.meta.url), lines.join("\n") + "\n");
  console.log(`Wrote supabase/${nationalFile} — ${clubs.length} clubs, ${coaches.length} coaches.`);
  process.exit(0);
}

// Schools
lines.push("-- Schools ------------------------------------------------------");
for (const sc of SCHOOLS) {
  lines.push(
    `insert into public.schools (id, slug, name, region, city, state, zip, lat, lng, type, fhsaa_class, district, mascot, colors, logo_color, programs, head_coach_boys, head_coach_girls, state_titles, last_title, district_titles, enrollment, description, website, featured, plan) values (` +
      [
        s(sc.id), s(sc.slug), s(sc.name), s(sc.region), s(sc.city), s(sc.state), s(sc.zip),
        n(sc.lat), n(sc.lng), s(sc.type), s(sc.fhsaa_class), s(sc.district), s(sc.mascot),
        arr(sc.colors), s(sc.logo_color), arr(sc.programs), s(sc.head_coach_boys), s(sc.head_coach_girls),
        n(sc.state_titles), n(sc.last_title), n(sc.district_titles), n(sc.enrollment), s(sc.description), s(sc.website),
        b(sc.featured), s(sc.plan),
      ].join(", ") +
      `) on conflict (id) do nothing;`
  );
}
lines.push("");

// Reviews (club + coach + school)
lines.push("-- Reviews ------------------------------------------------------");
for (const c of CLUBS) {
  for (const r of c.reviews) {
    lines.push(
      `insert into public.reviews (subject_type, subject_id, author_name, relationship, title, body, scores, overall_rating, created_at) values (` +
        [
          s("club"), s(c.id), s(r.author), s(r.relationship), s(r.title), s(r.body),
          `'${JSON.stringify(r.scores).replace(/'/g, "''")}'::jsonb`, n(r.rating), s(r.created_at),
        ].join(", ") +
        `);`
    );
  }
}
for (const c of COACHES) {
  for (const r of c.reviews) {
    lines.push(
      `insert into public.reviews (subject_type, subject_id, author_name, relationship, title, body, scores, overall_rating, created_at) values (` +
        [
          s("coach"), s(c.id), s(r.author), s(r.relationship), s(r.title), s(r.body),
          `'${JSON.stringify(r.scores).replace(/'/g, "''")}'::jsonb`, n(r.rating), s(r.created_at),
        ].join(", ") +
        `);`
    );
  }
}
for (const sc of SCHOOLS) {
  for (const r of sc.reviews) {
    lines.push(
      `insert into public.reviews (subject_type, subject_id, author_name, relationship, title, body, scores, overall_rating, created_at) values (` +
        [
          s("school"), s(sc.id), s(r.author), s(r.relationship), s(r.title), s(r.body),
          `'${JSON.stringify(r.scores).replace(/'/g, "''")}'::jsonb`, n(r.rating), s(r.created_at),
        ].join(", ") +
        `);`
    );
  }
}
lines.push("");

// Tryouts
lines.push("-- Tryouts ------------------------------------------------------");
for (const t of TRYOUTS) {
  lines.push(
    `insert into public.tryouts (club_id, club_name, club_slug, region, city, age_groups, gender, date, note) values (` +
      [
        s(t.club_id), s(t.club_name), s(t.club_slug), s(t.region), s(t.city),
        s(t.age_groups), s(t.gender), s(t.date), s(t.note),
      ].join(", ") +
      `);`
  );
}
lines.push("");

// Rankings are no longer seeded — they're derived at runtime from the live
// directory (DB + seed) and the real monthly community votes in getRankings().

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n"));
console.log(`Wrote supabase/seed.sql — ${CLUBS.length} clubs, ${COACHES.length} coaches, ${SCHOOLS.length} schools.`);
