import { CLUBS } from "./seed";
import { SCHOOLS } from "./schools";
import type { Commitment } from "./types";
import type { RegionKey } from "./regions";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function rng(seed: string) {
  let s = hash(seed) || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

const FIRST = ["Mateo", "Sofia", "Liam", "Olivia", "Diego", "Emma", "Lucas", "Mia", "Gabriel", "Ava", "Noah", "Isabella", "Ethan", "Camila", "Carlos", "Valentina", "Aiden", "Lucia", "Andre", "Maya"];
const LAST = ["Garcia", "Martinez", "Smith", "Johnson", "Rodriguez", "Brown", "Hernandez", "Davis", "Lopez", "Wilson", "Perez", "Taylor", "Sanchez", "Moore", "Reyes", "Clark", "Torres", "Walker", "Flores", "Bennett"];

const COLLEGES_FL = ["University of Florida", "Florida State University", "University of Miami", "UCF", "USF", "Florida Gulf Coast", "Stetson University", "Jacksonville University", "FIU", "Florida Atlantic"];
const COLLEGES_NATIONAL = ["Stanford", "North Carolina", "UCLA", "Notre Dame", "Duke", "Wake Forest", "Clemson", "Virginia", "Indiana", "Georgetown", "Penn State", "Michigan", "Maryland", "Vanderbilt", "Boston College"];
const PRO_TEAMS = ["Inter Miami CF", "Orlando City SC", "Tampa Bay Rowdies", "Inter Miami CF II (MLS NEXT Pro)", "Orlando City B", "Houston Dynamo FC", "Philadelphia Union II", "Charlotte FC"];
const NATIONAL_TEAMS_BOYS = ["U-15 USYNT", "U-16 USYNT", "U-17 USYNT", "U-19 USYNT", "U-20 USYNT"];
const NATIONAL_TEAMS_GIRLS = ["U-15 USYNT", "U-16 USYNT", "U-17 USYNT", "U-18 USYNT", "U-20 USYNT"];
const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
const DIVISIONS = ["NCAA D1", "NCAA D1", "NCAA D1", "NCAA D2", "NCAA D3", "NAIA"];
const COLORS = ["#1a4fa0", "#0a1628", "#2a7de1", "#1d7a4d", "#9b2d2d", "#5a2d82", "#b8860b"];

function makeCommitment(seed: string, i: number, owner: {
  region: RegionKey;
  club?: { id: string; name: string; slug: string };
  school?: { id: string; name: string; slug: string };
}): Commitment {
  const r = rng(seed + ":" + i);
  const gender = r() > 0.5 ? "Boys" : "Girls";
  const roll = r();
  const dest_type: Commitment["dest_type"] = roll > 0.9 ? "National Team" : roll > 0.72 ? "Pro" : "College";
  let destination: string;
  let division: string | undefined;
  if (dest_type === "College") {
    destination = r() > 0.45 ? pick(COLLEGES_FL, r) : pick(COLLEGES_NATIONAL, r);
    division = pick(DIVISIONS, r);
  } else if (dest_type === "Pro") {
    destination = pick(PRO_TEAMS, r);
  } else {
    destination = pick(gender === "Boys" ? NATIONAL_TEAMS_BOYS : NATIONAL_TEAMS_GIRLS, r);
  }
  const gradYear = 2024 + Math.floor(r() * 4);
  const daysAgo = Math.floor(r() * 420) + 2;
  return {
    id: `${seed}-commit-${i}`,
    player_name: `${pick(FIRST, r)} ${pick(LAST, r)}`,
    grad_year: gradYear,
    gender,
    position: pick(POSITIONS, r),
    dest_type,
    destination,
    division,
    region: owner.region,
    club_id: owner.club?.id,
    club_name: owner.club?.name,
    club_slug: owner.club?.slug,
    school_id: owner.school?.id,
    school_name: owner.school?.name,
    school_slug: owner.school?.slug,
    date: new Date(Date.UTC(2026, 5, 1) - daysAgo * 86400000).toISOString(),
    color: COLORS[(hash(seed) + i) % COLORS.length],
  };
}

/* Only paid (Pro/Featured) profiles showcase commitments — that's the benefit.
   Featured get more; free get none. */
export const COMMITMENTS: Commitment[] = (() => {
  const out: Commitment[] = [];
  for (const c of CLUBS) {
    const n = c.plan === "featured" ? 4 + Math.floor(rng(c.slug + "n")() * 4) : c.plan === "pro" ? 1 + Math.floor(rng(c.slug + "n")() * 3) : 0;
    for (let i = 0; i < n; i++) {
      out.push(makeCommitment(c.slug, i, { region: c.region, club: { id: c.id, name: c.name, slug: c.slug } }));
    }
  }
  for (const s of SCHOOLS) {
    const n = s.plan === "featured" ? 3 + Math.floor(rng(s.slug + "n")() * 3) : s.plan === "pro" ? 1 + Math.floor(rng(s.slug + "n")() * 2) : 0;
    for (let i = 0; i < n; i++) {
      out.push(makeCommitment(s.slug, i + 100, { region: s.region, school: { id: s.id, name: s.name, slug: s.slug } }));
    }
  }
  return out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
})();
