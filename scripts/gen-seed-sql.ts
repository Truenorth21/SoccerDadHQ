/**
 * Generates supabase/seed.sql from the canonical seed data in lib/seed.ts
 * so the database seed always matches what the app ships with.
 *
 *   npx tsx scripts/gen-seed-sql.ts
 */
import { writeFileSync } from "node:fs";
import { CLUBS, COACHES, TRYOUTS } from "../lib/seed";
import { SCHOOLS } from "../lib/schools";
import { RANKINGS } from "../lib/rankings";

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

const lines: string[] = [];
lines.push("-- ============================================================");
lines.push("--  SoccerDadHQ — seed data (generated from lib/seed.ts)");
lines.push("--  Run AFTER schema.sql.");
lines.push("-- ============================================================");
lines.push("");

// Clubs
lines.push("-- Clubs --------------------------------------------------------");
for (const c of CLUBS) {
  lines.push(
    `insert into public.clubs (id, slug, name, region, city, state, zip, lat, lng, founded, description, logo_color, website, email, phone, instagram, facebook, twitter, leagues, age_groups, genders, tryouts_open, tryout_note, claimed, verified, featured, plan) values (` +
      [
        s(c.id), s(c.slug), s(c.name), s(c.region), s(c.city), s(c.state), s(c.zip),
        n(c.lat), n(c.lng), n(c.founded), s(c.description), s(c.logo_color), s(c.website),
        s(c.email), s(c.phone), s(c.instagram), s(c.facebook), s(c.twitter),
        arr(c.leagues), arr(c.age_groups), arr(c.genders), b(c.tryouts_open),
        s(c.tryout_note), b(c.claimed), b(c.verified), b(c.featured), s(c.plan),
      ].join(", ") +
      `) on conflict (id) do nothing;`
  );
}
lines.push("");

// Coaches
lines.push("-- Coaches ------------------------------------------------------");
for (const c of COACHES) {
  lines.push(
    `insert into public.coaches (id, slug, name, region, city, club_id, club_name, title, bio, photo_color, certifications, specialties, age_groups, genders, private_training, private_training_note, email, phone, featured, plan) values (` +
      [
        s(c.id), s(c.slug), s(c.name), s(c.region), s(c.city), s(c.club_id ?? null),
        s(c.club_name), s(c.title), s(c.bio), s(c.photo_color), arr(c.certifications),
        arr(c.specialties), arr(c.age_groups), arr(c.genders), b(c.private_training),
        s(c.private_training_note), s(c.email), s(c.phone), b(c.featured), s(c.plan),
      ].join(", ") +
      `) on conflict (id) do nothing;`
  );
}
lines.push("");

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

// Rankings
lines.push("-- Rankings -----------------------------------------------------");
for (const [category, items] of Object.entries(RANKINGS)) {
  for (const it of items) {
    lines.push(
      `insert into public.rankings (id, category, name, subtitle, region, league, votes, trend, href) values (` +
        [
          s(it.id), s(category), s(it.name), s(it.subtitle), s(it.region),
          s(it.league ?? null), n(it.votes), s(it.trend), s(it.href ?? null),
        ].join(", ") +
        `) on conflict (id) do nothing;`
    );
  }
}
lines.push("");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n"));
console.log(`Wrote supabase/seed.sql — ${CLUBS.length} clubs, ${COACHES.length} coaches, ${SCHOOLS.length} schools.`);
