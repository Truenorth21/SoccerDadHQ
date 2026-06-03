import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SignOutButton from "@/components/SignOutButton";
import ClubCard from "@/components/ClubCard";
import FavoritesPanel from "@/components/FavoritesPanel";
import { getFeaturedClubs } from "@/lib/data";
import { initials } from "@/lib/utils";

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
  const suggested = getFeaturedClubs(3);

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
        <SignOutButton />
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">
          You're viewing a <strong>demo dashboard</strong>. Connect Supabase in <code>.env.local</code> to
          enable real accounts, saved clubs and persistent reviews.
        </div>
      )}

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
