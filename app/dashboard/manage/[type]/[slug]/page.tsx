import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isProfileOwner } from "@/lib/claims";
import { getClubBySlug, getCoachBySlug, getSchoolBySlug, getSupabaseReviews, OVERRIDE_FIELDS } from "@/lib/data";
import { getListingBySlug, type ListingKind } from "@/lib/listings";
import { getLogo } from "@/lib/logos";
import OwnerEditor from "@/components/OwnerEditor";

export const metadata: Metadata = { title: "Manage your profile", robots: { index: false } };
export const dynamic = "force-dynamic";

const LISTING_KINDS = ["training-center", "facility", "tournament", "camp"];
const LOGO_TYPES = ["club", "school", "coach", "training-center", "facility", "tournament", "camp"];
const PROFILE_BASE: Record<string, string> = {
  club: "/clubs", school: "/schools", coach: "/coaches",
  "training-center": "/training-centers", facility: "/facilities", tournament: "/tournaments", camp: "/camps",
};

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-3xl font-bold uppercase text-navy">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{children}</p>
      <Link href="/dashboard" className="btn-primary mt-5">Back to dashboard</Link>
    </div>
  );
}

async function loadEntity(type: string, slug: string): Promise<any | undefined> {
  if (type === "club") return getClubBySlug(slug);
  if (type === "coach") return getCoachBySlug(slug);
  if (type === "school") return getSchoolBySlug(slug);
  if (LISTING_KINDS.includes(type)) return getListingBySlug(type as ListingKind, slug);
  return undefined;
}

export default async function ManageProfilePage({ params }: { params: { type: string; slug: string } }) {
  const { type, slug } = params;
  const allowed = OVERRIDE_FIELDS[type];
  if (!allowed) return <Notice title="Unknown profile type">That profile type can&rsquo;t be managed here.</Notice>;

  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;
  if (!userId) return <Notice title="Log in">Sign in with the account that claimed this profile.</Notice>;
  if (!(await isProfileOwner(type, slug, userId))) {
    return <Notice title="Not your profile">Only the owner who claimed this profile can edit it. If you just paid, give it a moment and refresh.</Notice>;
  }

  const entity = await loadEntity(type, slug);
  if (!entity) return <Notice title="Profile not found">We couldn&rsquo;t load that profile.</Notice>;

  const reviews = await getSupabaseReviews(type, entity.id);
  const initial: Record<string, unknown> = {};
  for (const k of allowed) initial[k] = entity[k];
  const canLogo = LOGO_TYPES.includes(type);
  const currentLogo = canLogo ? await getLogo(type, slug) : null;

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Manage profile</h1>
            <p className="mt-1 text-slate-300">{entity.name}</p>
          </div>
          <Link href={`${PROFILE_BASE[type]}/${slug}`} className="btn-outline text-sm">
            View public profile →
          </Link>
        </div>
      </section>
      <div className="container-page py-8">
        <OwnerEditor
          subjectType={type}
          slug={slug}
          name={entity.name}
          allowed={allowed}
          initial={initial}
          currentLogo={currentLogo}
          canLogo={canLogo}
          reviews={reviews.map((r) => ({ id: r.id, author: r.author, rating: r.rating, title: r.title, body: r.body, created_at: r.created_at, owner_reply: r.owner_reply }))}
        />
      </div>
    </>
  );
}
