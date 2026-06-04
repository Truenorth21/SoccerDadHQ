import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Crest, { GradientPanel } from "@/components/Crest";
import { RatingBadge } from "@/components/Stars";
import CategoryScores from "@/components/CategoryScores";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import ContactForm from "@/components/ContactForm";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import ShareButtons from "@/components/ShareButtons";
import RankingVote from "@/components/RankingVote";
import ClaimForm from "@/components/ClaimForm";
import { getCoachBySlug, getSupabaseReviews, getClubBySlug } from "@/lib/data";
import { COACHES, slugify } from "@/lib/seed";
// COACHES used by generateStaticParams
import { COACH_REVIEW_CATEGORIES, regionName } from "@/lib/regions";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export function generateStaticParams() {
  return COACHES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const coach = await getCoachBySlug(params.slug);
  if (!coach) return { title: "Coach not found" };
  const title = `${coach.name} — ${coach.title}, ${coach.club_name}`;
  const description = `${coach.name}, ${coach.title} at ${coach.club_name} (${coach.city}, FL). ${coach.rating.toFixed(1)}★ from ${coach.review_count} reviews. ${coach.specialties.join(", ")}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/coaches/${coach.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/coaches/${coach.slug}`, type: "profile" },
  };
}

export default async function CoachProfile({ params }: { params: { slug: string } }) {
  const coach = await getCoachBySlug(params.slug);
  if (!coach) notFound();

  const extraReviews = await getSupabaseReviews("coach", coach.id);
  const reviews = [...extraReviews, ...coach.reviews];
  const rankingPeriod = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const club = coach.club_name ? await getClubBySlug(slugify(coach.club_name)) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.name,
    jobTitle: coach.title,
    description: coach.bio,
    url: `${SITE_URL}/coaches/${coach.slug}`,
    worksFor: { "@type": "SportsTeam", name: coach.club_name },
    address: { "@type": "PostalAddress", addressLocality: coach.city, addressRegion: "FL", addressCountry: "US" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: coach.rating.toFixed(1),
      reviewCount: coach.review_count,
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={[{ label: "Coaches", href: "/coaches" }, { label: coach.name }]} />

      <div className="relative">
        <GradientPanel seed={coach.slug} color={coach.photo_color} className="h-32 w-full sm:h-44" />
        <div className="container-page">
          <div className="relative -mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <div className="rounded-full bg-white p-1.5 shadow-card-hover">
              <Crest name={coach.name} color={coach.photo_color} size="xl" rounded="full" />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-navy sm:text-4xl">
                {coach.name}
              </h1>
              <p className="mt-1 text-slate-600">
                {coach.title} ·{" "}
                {club ? (
                  <Link href={`/clubs/${club.slug}`} className="text-brand-blue hover:underline">
                    {coach.club_name}
                  </Link>
                ) : (
                  coach.club_name
                )}
              </p>
              <p className="text-sm text-slate-500">{coach.city}, FL · {regionName(coach.region)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <RatingBadge value={coach.rating} count={reviews.length} />
                <ShareButtons path={`/coaches/${coach.slug}`} title={`${coach.name} — ${coach.title}, SoccerDadHQ`} />
              </div>
            </div>
            {coach.private_training && (
              <div className="pb-2">
                <span className="chip-amber">Private training available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <section>
              <h2 className="section-title mb-3">Bio</h2>
              <p className="leading-relaxed text-slate-700">{coach.bio}</p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="card p-4">
                <h3 className="label">Certifications</h3>
                <ul className="space-y-1.5">
                  {coach.certifications.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-brand-sky">🎓</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-4">
                <h3 className="label">Specialties</h3>
                <div className="flex flex-wrap gap-1.5">
                  {coach.specialties.map((s) => (
                    <span key={s} className="chip-sky">{s}</span>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <h3 className="label">Age Groups</h3>
                <div className="flex flex-wrap gap-1.5">
                  {coach.age_groups.map((a) => (
                    <span key={a} className="chip">{a}</span>
                  ))}
                </div>
              </div>
              {coach.private_training && (
                <div className="card border-l-4 border-brand-amber p-4">
                  <h3 className="label text-amber-700">Private Training</h3>
                  <p className="text-sm text-slate-700">{coach.private_training_note}</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="section-title mb-4">Rating Breakdown</h2>
              <div className="card p-6">
                <CategoryScores categories={COACH_REVIEW_CATEGORIES} scores={coach.scores as unknown as Record<string, number>} />
              </div>
            </section>

            <section id="reviews" className="scroll-mt-20">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Reviews</h2>
                <span className="text-sm text-slate-500">{reviews.length} total</span>
              </div>
              <div className="mb-6">
                <ReviewForm
                  subjectType="coach"
                  subjectId={coach.id}
                  subjectName={coach.name}
                  categories={COACH_REVIEW_CATEGORIES}
                />
              </div>
              <ReviewList reviews={reviews} categories={COACH_REVIEW_CATEGORIES} />
            </section>
          </div>

          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <RankingVote itemId={coach.id} itemName={coach.name} period={rankingPeriod} />
            <ContactForm recipient={coach.name} />
            {club && (
              <div className="card p-5">
                <h3 className="mb-2 font-heading text-lg font-bold uppercase text-navy">Club</h3>
                <Link href={`/clubs/${club.slug}`} className="flex items-center gap-3 hover:opacity-80">
                  <Crest name={club.name} color={club.logo_color} size="sm" />
                  <div>
                    <p className="font-heading font-bold text-navy">{club.name}</p>
                    <p className="text-xs text-slate-500">{club.city}, FL</p>
                  </div>
                </Link>
              </div>
            )}

            <div className="card border-2 border-dashed border-slate-200 p-5 text-center">
              <h3 className="font-heading text-lg font-bold text-navy">Is this you?</h3>
              <p className="mt-1 text-sm text-slate-500">Claim your coach profile to manage your bio, respond to reviews and list private training.</p>
              <div className="mt-3">
                <ClaimForm subjectType="coach" subjectSlug={coach.slug} subjectName={coach.name} />
              </div>
            </div>

            {!coach.featured && <AdSlot placement="profile-sidebar" seed={coach.name.length} />}
          </div>
        </div>
      </div>
    </>
  );
}
