import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { adminServiceClient } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import ClubCard from "@/components/ClubCard";
import FavoritesPanel from "@/components/FavoritesPanel";
import Inbox from "@/components/Inbox";
import OwnerProfiles, { type OwnedProfile, type OwnedRank } from "@/components/OwnerProfiles";
import { getFeaturedClubs, loadClubs, loadSchools, loadCoaches } from "@/lib/data";
import { loadListings } from "@/lib/listings";
import { getRankFor } from "@/lib/rankings";
import { regionName } from "@/lib/regions";
import { initials, SITE_URL } from "@/lib/utils";

const PROFILE_BASE: Record<string, string> = {
  club: "/clubs", school: "/schools", coach: "/coaches",
  "training-center": "/training-centers", facility: "/facilities", tournament: "/tournaments", camp: "/camps",
};

const RANK_CATEGORY: Record<string, string> = {
  club: "clubs", school: "schools", coach: "coaches",
  "training-center": "training-centers", facility: "facilities", tournament: "tournaments", camp: "camps",
};

export const metadata: Metadata = { title: "My Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  // Pull this user's reviews + admin flag if signed in.
  type MyReview = { id: string; subject_type: string; overall_rating: number; title: string; body: string };
  let myReviews: MyReview[] = [];
  let isAdmin = false;
  if (supabase && user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = (profile as { role?: string } | null)?.role === "admin";
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    myReviews = (data ?? []) as MyReview[];
  }

  // Inbox — messages targeted to this user (all / their groups / direct).
  let inbox: { id: string; subject: string; body: string; created_at: string; unread: boolean }[] = [];
  if (user) {
    const svc = adminServiceClient();
    if (svc) {
      try {
        const { data: gm } = await svc.from("user_group_members").select("group_id").eq("user_id", user.id);
        const groupIds = (gm ?? []).map((r: any) => r.group_id);
        const clauses = ["audience.eq.all", `target_user.eq.${user.id}`];
        if (groupIds.length) clauses.push(`target_group.in.(${groupIds.join(",")})`);
        const { data: msgs } = await svc
          .from("messages")
          .select("id,subject,body,created_at")
          .or(clauses.join(","))
          .order("created_at", { ascending: false })
          .limit(50);
        const { data: reads } = await svc.from("message_reads").select("message_id").eq("user_id", user.id);
        const readSet = new Set((reads ?? []).map((r: any) => r.message_id));
        inbox = (msgs ?? []).map((m: any) => ({ ...m, unread: !readSet.has(m.id) }));
      } catch {
        /* messaging tables may not exist yet */
      }
    }
  }

  // Claimed profiles this user owns (views, reviews, messages, expiry).
  let owned: OwnedProfile[] = [];
  if (user) {
    const svc = adminServiceClient();
    if (svc) {
      try {
        const { data: claims } = await svc.from("profile_claims").select("*").eq("owner_id", user.id);
        if (claims && claims.length) {
          const types = new Set(claims.map((c: any) => c.subject_type));
          const listingKinds = ["training-center", "facility", "tournament", "camp"];
          const [clubs, schools, coaches, listings] = await Promise.all([
            types.has("club") ? loadClubs() : Promise.resolve([]),
            types.has("school") ? loadSchools() : Promise.resolve([]),
            types.has("coach") ? loadCoaches() : Promise.resolve([]),
            listingKinds.some((k) => types.has(k)) ? loadListings() : Promise.resolve([]),
          ]);
          const since = new Date(Date.now() - 30 * 86400000).toISOString();
          const rankPeriod = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
          owned = await Promise.all(
            claims.map(async (c: any) => {
              const href = `${PROFILE_BASE[c.subject_type] ?? ""}/${c.subject_slug}`;
              const pool = c.subject_type === "club" ? clubs : c.subject_type === "school" ? schools : c.subject_type === "coach" ? coaches : listings;
              const ent = (pool as any[]).find((e) => e.slug === c.subject_slug);
              const [{ count: views }, { data: msgs }] = await Promise.all([
                svc.from("visits").select("*", { count: "exact", head: true }).eq("path", href).gte("created_at", since),
                svc.from("profile_messages").select("*").eq("subject_type", c.subject_type).eq("subject_slug", c.subject_slug).order("created_at", { ascending: false }),
              ]);
              const daysLeft = c.claimed_until
                ? Math.ceil((+new Date(`${c.claimed_until}T00:00:00Z`) - Date.now()) / 86400000)
                : null;

              // Live rank + month-over-month trend (from the ranking_snapshots history).
              let rank: OwnedRank | null = null;
              const category = RANK_CATEGORY[c.subject_type];
              if (ent && category) {
                try {
                  const ri = await getRankFor(category, ent.id, { prefix: c.subject_type === "school" });
                  if (ri) {
                    let trend: OwnedRank["trend"] = "new";
                    let delta = 0;
                    const { data: snap } = await svc
                      .from("ranking_snapshots")
                      .select("rank")
                      .eq("item_id", ri.itemId)
                      .order("period", { ascending: false })
                      .limit(1)
                      .maybeSingle();
                    if (snap) {
                      delta = Number(snap.rank) - ri.rank; // +ve = climbed (lower number)
                      trend = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
                    }
                    rank = {
                      regionRank: ri.regionRank,
                      regionTotal: ri.regionTotal,
                      rank: ri.rank,
                      region: regionName(ri.region),
                      votes: ri.votes,
                      programLabel: ri.programLabel,
                      trend,
                      delta,
                    };
                  }
                } catch {
                  /* rankings/snapshots unavailable — skip the block */
                }
              }

              return {
                type: c.subject_type,
                slug: c.subject_slug,
                name: ent?.name ?? c.subject_name ?? c.subject_slug,
                href,
                profileUrl: `${SITE_URL}${href}`,
                period: rankPeriod,
                plan: c.plan ?? "claim",
                claimedUntil: c.claimed_until ?? null,
                daysLeft,
                views: views ?? 0,
                reviews: ent?.review_count ?? 0,
                rank,
                messages: (msgs ?? []).map((m: any) => ({ id: m.id, from_name: m.from_name, from_email: m.from_email, body: m.body, created_at: m.created_at, read: m.read })),
              } as OwnedProfile;
            })
          );
        }
      } catch {
        /* profile_claims table may not exist yet */
      }
    }
  }

  // Not signed in (and Supabase available) → prompt to log in.
  if (isSupabaseConfigured && !user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-heading text-3xl font-bold uppercase text-navy">Please log in</h1>
        <p className="mt-2 text-slate-500">You need an account to view your dashboard.</p>
        <Link href="/login" className="btn-primary mt-5">Log in or sign up</Link>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] ?? "SoccerDad";
  const email = user?.email ?? "demo@soccerdadhq.com";
  const suggested = await getFeaturedClubs(3);

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-navy font-heading text-2xl font-bold text-white">
            {initials(displayName)}
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase text-navy">
              Welcome, {displayName}
            </h1>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">
          You're viewing a <strong>demo dashboard</strong>. Connect Supabase in <code>.env.local</code> to
          enable real accounts, saved clubs and persistent reviews.
        </div>
      )}

      {/* Claimed-profile owner panel (hidden when none) */}
      <OwnerProfiles profiles={owned} />

      {/* Messages from SoccerDadHQ (hidden when none) */}
      <Inbox messages={inbox} />

      {/* Saved favorites (localStorage-backed, works in demo + logged-out) */}
      <div className="mt-8">
        <FavoritesPanel />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* My reviews */}
        <div className="lg:col-span-2">
          <h2 className="section-title mb-4">My Reviews</h2>
          {myReviews.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-500">You haven't written any reviews yet.</p>
              <Link href="/clubs" className="btn-primary mt-4">Find a club to review</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {myReviews.map((r) => (
                <li key={r.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="chip-sky">{r.subject_type}</span>
                    <span className="font-heading font-bold text-amber-700">{Number(r.overall_rating).toFixed(1)}★</span>
                  </div>
                  <h3 className="mt-2 font-heading text-lg font-bold text-navy">{r.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Account */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 font-heading text-lg font-bold uppercase text-navy">Quick links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/clubs" className="text-brand-blue hover:underline">Browse clubs →</Link></li>
              <li><Link href="/coaches" className="text-brand-blue hover:underline">Browse coaches →</Link></li>
              <li><Link href="/rankings" className="text-brand-blue hover:underline">Vote in rankings →</Link></li>
              <li><Link href="/news" className="text-brand-blue hover:underline">Read the latest news →</Link></li>
              {isAdmin && (
                <li><Link href="/admin" className="font-semibold text-brand-amber hover:underline">⚙ Moderation queue →</Link></li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested */}
      <section className="mt-12">
        <h2 className="section-title mb-4">Top-Rated Clubs to Explore</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {suggested.map((c) => (
            <ClubCard key={c.id} club={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
