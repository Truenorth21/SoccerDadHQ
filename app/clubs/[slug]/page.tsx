import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Crest, { GradientPanel } from "@/components/Crest";
import { RatingBadge } from "@/components/Stars";
import CategoryScores from "@/components/CategoryScores";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import ClubCard from "@/components/ClubCard";
import CoachCard from "@/components/CoachCard";
import ClaimPanel, { OwnerChip } from "@/components/ClaimPanel";
import TryoutAlertSignup from "@/components/TryoutAlertSignup";
import { getClaimStatus, resolveTier } from "@/lib/claims";
import ContactForm from "@/components/ContactForm";
import Breadcrumbs from "@/components/Breadcrumbs";
import MapEmbed from "@/components/MapEmbed";
import AdSlot from "@/components/AdSlot";
import LogoManager from "@/components/LogoManager";
import ShareButtons from "@/components/ShareButtons";
import RankingVote from "@/components/RankingVote";
import RankBadgeShare from "@/components/RankBadgeShare";
import { getRankFor } from "@/lib/rankings";
import { getLogo } from "@/lib/logos";
import {
  getClubBySlug,
  getNearbyClubs,
  getCoachesForClub,
  getSupabaseReviews,
  getCommitmentsForClub,
  loadClubs,
} from "@/lib/data";
import CommitmentCard from "@/components/CommitmentCard";
import CommitmentForm from "@/components/CommitmentForm";
import { CLUB_REVIEW_CATEGORIES, regionName } from "@/lib/regions";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

// Build params from the live directory (seed + DB) so real imported clubs are
// pre-rendered too — runtime DB reads on dynamic routes can't be relied on alone.
export async function generateStaticParams() {
  return (await loadClubs()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const club = await getClubBySlug(params.slug);
  if (!club) return { title: "Club not found" };
  const title = `${club.name} — Reviews, Tryouts & Info`;
  const ratingBit = club.review_count > 0 ? `${club.rating.toFixed(1)}★ from ${club.review_count} parent reviews. ` : "";
  const description = `${club.name} in ${club.city}, FL. ${ratingBit}Leagues: ${club.leagues.join(", ")}. Age groups ${club.age_groups[0]}–${club.age_groups[club.age_groups.length - 1]}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/clubs/${club.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/clubs/${club.slug}`, type: "website" },
  };
}

export default async function ClubProfile({ params }: { params: { slug: string } }) {
  const club = await getClubBySlug(params.slug);
  if (!club) notFound();

  const extraReviews = await getSupabaseReviews("club", club.id);
  const reviews = [...extraReviews, ...club.reviews];
  const coaches = await getCoachesForClub(club.id);
  const commitments = getCommitmentsForClub(club.id);
  const nearby = await getNearbyClubs(club, 4);
  const rankingPeriod = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const rankInfo = await getRankFor("clubs", club.id);
  const tier = resolveTier(await getClaimStatus("club", club.slug));
  const logo = await getLogo("club", club.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: club.name,
    description: club.description,
    url: `${SITE_URL}/clubs/${club.slug}`,
    telephone: club.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: club.city,
      addressRegion: "FL",
      postalCode: club.zip,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: club.lat, longitude: club.lng },
    // Only advertise ratings/reviews markup when there are real reviews (Google policy).
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: club.rating.toFixed(1),
            reviewCount: reviews.length,
            bestRating: "5",
            worstRating: "1",
          },
          review: reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.created_at.slice(0, 10),
            reviewRating: { "@type": "Rating", ratingValue: r.rating.toFixed(1), bestRating: "5" },
            name: r.title,
            reviewBody: r.body,
          })),
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]} />

      {/* Banner */}
      <div className="relative">
        <GradientPanel seed={club.slug} color={club.logo_color} className="h-40 w-full sm:h-56" />
        <div className="container-page">
          <div className="relative -mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end">
            <div className="rounded-2xl bg-white p-2 shadow-card-hover">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={`${club.name} logo`} className="h-28 w-28 rounded-xl object-contain" />
              ) : (
                <Crest name={club.name} color={club.logo_color} size="xl" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-navy sm:text-4xl">
                  {club.name}
                </h1>
                <OwnerChip tier={tier} />
                {club.tryouts_open && <span className="chip-amber">Tryouts open</span>}
              </div>
              <p className="mt-1 text-slate-600">
                {club.city}, FL · {regionName(club.region)} · Est. {club.founded}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <RatingBadge value={club.rating} count={reviews.length} />
                <ShareButtons path={`/clubs/${club.slug}`} title={`${club.name} — SoccerDadHQ`} />
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              {club.website && (
                <a href={club.website} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  Visit website
                </a>
              )}
              <Link href={`/clubs/${club.slug}#reviews`} className="btn-outline text-sm">
                Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* MAIN */}
          <div className="space-y-10 lg:col-span-2">
            {/* Gallery */}
            <section>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {club.gallery.map((g, i) => (
                  <GradientPanel
                    key={g}
                    seed={g}
                    color={club.logo_color}
                    className="aspect-[4/3] rounded-xl"
                    label={["Training", "Match Day", "Facilities", "Team"][i] ?? "Club"}
                  />
                ))}
              </div>
            </section>

            {/* About */}
            <section>
              <h2 className="section-title mb-3">About {club.name}</h2>
              <p className="leading-relaxed text-slate-700">{club.description}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="card p-4">
                  <h3 className="label">Leagues</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {club.leagues.map((l) => (
                      <span key={l} className="chip-sky">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="card p-4">
                  <h3 className="label">Age Groups</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {club.age_groups.map((a) => (
                      <span key={a} className="chip">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="card p-4">
                  <h3 className="label">Programs for</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {club.genders.map((g) => (
                      <span key={g} className="chip">{g}</span>
                    ))}
                  </div>
                </div>
                {club.tryouts_open && (
                  <div className="card border-l-4 border-brand-amber p-4">
                    <h3 className="label text-amber-700">Tryouts</h3>
                    {(club as { next_tryout_date?: string }).next_tryout_date && (
                      <p className="text-sm font-semibold text-navy">
                        Next date:{" "}
                        {new Date(`${(club as { next_tryout_date?: string }).next_tryout_date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                    {club.tryout_note && <p className="mt-1 text-sm text-slate-700">{club.tryout_note}</p>}
                  </div>
                )}
              </div>
            </section>

            {/* Rating breakdown */}
            <section>
              <h2 className="section-title mb-4">Rating Breakdown</h2>
              <div className="card p-6">
                <CategoryScores categories={CLUB_REVIEW_CATEGORIES} scores={club.scores as unknown as Record<string, number>} />
              </div>
            </section>

            {/* Coaches */}
            {coaches.length > 0 && (
              <section>
                <h2 className="section-title mb-4">Coaches at {club.name}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {coaches.map((c) => (
                    <CoachCard key={c.id} coach={c} />
                  ))}
                </div>
              </section>
            )}

            {/* Commitments — a Featured profile benefit */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">College &amp; Pro Commitments</h2>
                {tier !== "unclaimed" && (
                  <CommitmentForm subjectType="club" subjectSlug={club.slug} subjectName={club.name} />
                )}
              </div>
              {tier === "unclaimed" ? (
                <div className="card border-2 border-dashed border-slate-200 p-6 text-center">
                  <p className="font-heading text-lg font-bold text-navy">Showcase where your players go</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Announcing college, pro &amp; national-team commitments is a Claim &amp; Featured profile benefit —
                    a track record that helps families choose your club.
                  </p>
                  <Link href="/advertise" className="btn-primary mt-3">Upgrade to announce commitments</Link>
                </div>
              ) : commitments.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No commitments announced yet — use “Announce a commitment” to add your first.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {commitments.map((c) => (
                    <CommitmentCard key={c.id} commitment={c} showSource={false} />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section id="reviews" className="scroll-mt-20">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Parent &amp; Player Reviews</h2>
                <span className="text-sm text-slate-500">{reviews.length} total</span>
              </div>
              <div className="mb-6">
                <ReviewForm
                  subjectType="club"
                  subjectId={club.id}
                  subjectName={club.name}
                  categories={CLUB_REVIEW_CATEGORIES}
                />
              </div>
              <ReviewList reviews={reviews} categories={CLUB_REVIEW_CATEGORIES} />
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            {rankInfo && (
              <RankBadgeShare
                name={club.name}
                profileUrl={`${SITE_URL}/clubs/${club.slug}`}
                period={rankingPeriod}
                categoryLabel="Clubs"
                regionName={regionName(club.region)}
                rank={rankInfo.rank}
                regionRank={rankInfo.regionRank}
                regionTotal={rankInfo.regionTotal}
                votes={rankInfo.votes}
              />
            )}
            <RankingVote itemId={club.id} itemName={club.name} period={rankingPeriod} category="clubs" profileUrl={`${SITE_URL}/clubs/${club.slug}`} />

            {/* Contact */}
            <div className="card p-5">
              <h3 className="mb-3 font-heading text-lg font-bold uppercase text-navy">Contact</h3>
              <ul className="space-y-2.5 text-sm">
                {club.website && (
                  <li className="flex gap-2">
                    <span className="text-slate-400">🌐</span>
                    <a href={club.website} target="_blank" rel="noopener noreferrer" className="truncate text-brand-blue hover:underline">
                      {club.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
                {club.email && (
                  <li className="flex gap-2">
                    <span className="text-slate-400">✉️</span>
                    <a href={`mailto:${club.email}`} className="truncate text-brand-blue hover:underline">{club.email}</a>
                  </li>
                )}
                {club.phone && (
                  <li className="flex gap-2">
                    <span className="text-slate-400">📞</span>
                    <a href={`tel:${club.phone}`} className="text-navy">{club.phone}</a>
                  </li>
                )}
                <li className="flex gap-2">
                  <span className="text-slate-400">📍</span>
                  <span className="text-navy">{club.city}, FL {club.zip}</span>
                </li>
              </ul>
              <div className="mt-4 flex gap-2">
                {club.instagram && <a href={club.instagram} target="_blank" rel="noopener noreferrer" className="chip hover:bg-slate-200">Instagram</a>}
                {club.facebook && <a href={club.facebook} target="_blank" rel="noopener noreferrer" className="chip hover:bg-slate-200">Facebook</a>}
                {club.twitter && <a href={club.twitter} target="_blank" rel="noopener noreferrer" className="chip hover:bg-slate-200">X</a>}
              </div>
            </div>

            {/* Contact the club */}
            <ContactForm recipient={club.name} subjectType="club" subjectSlug={club.slug} subjectName={club.name} />

            <TryoutAlertSignup region={club.region} regionName={regionName(club.region)} />

            {/* Map */}
            <MapEmbed lat={club.lat} lng={club.lng} label={club.name} city={club.city} zip={club.zip} />

            {/* Ownership — consistent across all profile types */}
            <ClaimPanel tier={tier} subjectType="club" slug={club.slug} name={club.name} label="club" />
            {tier === "unclaimed" && (
              <Link href="/advertise#tiers" className="-mt-2 block text-center text-xs font-semibold text-brand-blue hover:underline">
                Compare Free, Claim &amp; Featured plans →
              </Link>
            )}

            <LogoManager subjectType="club" slug={club.slug} currentLogo={logo} />

            {/* Featured profiles are ad-free; everyone else carries a local sponsor unit */}
            {tier === "unclaimed" && <AdSlot placement="profile-sidebar" seed={club.name.length} />}
          </div>
        </div>

        {/* Nearby */}
        <section className="mt-14">
          <h2 className="section-title mb-4">Nearby Clubs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
