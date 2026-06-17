import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Crest, { GradientPanel } from "@/components/Crest";
import { RatingBadge } from "@/components/Stars";
import CategoryScores from "@/components/CategoryScores";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import SchoolCard from "@/components/SchoolCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import MapEmbed from "@/components/MapEmbed";
import AdSlot from "@/components/AdSlot";
import LogoManager from "@/components/LogoManager";
import ShareButtons from "@/components/ShareButtons";
import ClaimPanel, { OwnerChip } from "@/components/ClaimPanel";
import TryoutAlertSignup from "@/components/TryoutAlertSignup";
import { getClaimStatus, resolveTier } from "@/lib/claims";
import { getLogo } from "@/lib/logos";
import { getSchoolBySlug, getNearbySchools, getSupabaseReviews, getCommitmentsForSchool, loadSchools } from "@/lib/data";
import CommitmentCard from "@/components/CommitmentCard";
import CommitmentForm from "@/components/CommitmentForm";
import RankBadgeShare from "@/components/RankBadgeShare";
import { getRankFor } from "@/lib/rankings";
import { SCHOOL_REVIEW_CATEGORIES, regionName } from "@/lib/regions";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

// Pre-render real imported schools too (seed + DB), not just seed.
export async function generateStaticParams() {
  return (await loadSchools()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const school = await getSchoolBySlug(params.slug);
  if (!school) return { title: "School not found" };
  const title = `${school.name} Soccer — Reviews & Program Info`;
  const ratingBit = school.review_count > 0 ? `${school.rating.toFixed(1)}★ from ${school.review_count} reviews. ` : "";
  const description = `${school.name} (${school.mascot}) ${school.fhsaa_class} ${school.type.toLowerCase()} high school soccer in ${school.city}, FL. ${ratingBit}${school.state_titles} state title${school.state_titles === 1 ? "" : "s"}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/schools/${school.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/schools/${school.slug}`, type: "website" },
  };
}

export default async function SchoolProfile({ params }: { params: { slug: string } }) {
  const school = await getSchoolBySlug(params.slug);
  if (!school) notFound();

  const extraReviews = await getSupabaseReviews("school", school.id);
  const reviews = [...extraReviews, ...school.reviews];
  const commitments = getCommitmentsForSchool(school.id);
  const nearby = await getNearbySchools(school, 4);
  const rankingPeriod = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const rankInfo = await getRankFor("schools", school.id, { prefix: true });
  const tier = resolveTier(await getClaimStatus("school", school.slug));
  const logo = await getLogo("school", school.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HighSchool",
    name: school.name,
    description: school.description,
    url: `${SITE_URL}/schools/${school.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: school.city,
      addressRegion: "FL",
      postalCode: school.zip,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: school.lat, longitude: school.lng },
    // Only advertise an aggregate rating when there are real reviews (Google policy).
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: school.rating.toFixed(1),
            reviewCount: reviews.length,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={[{ label: "Schools", href: "/schools" }, { label: school.name }]} />

      <div className="relative">
        <GradientPanel seed={school.slug} color={school.logo_color} className="h-40 w-full sm:h-56" />
        <div className="container-page">
          <div className="relative -mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end">
            <div className="rounded-2xl bg-white p-2 shadow-card-hover">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={`${school.name} logo`} className="h-28 w-28 rounded-xl object-contain" />
              ) : (
                <Crest name={school.name} color={school.logo_color} size="xl" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-navy sm:text-4xl">
                  {school.name}
                </h1>
                <span className="chip-sky">{school.fhsaa_class}</span>
                <span className="chip">{school.type}</span>
                {(school as { tryouts_open?: boolean }).tryouts_open && <span className="chip-amber">Tryouts open</span>}
                <OwnerChip tier={tier} />
              </div>
              <p className="mt-1 text-slate-600">
                {school.mascot} · {school.city}, FL · {regionName(school.region)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <RatingBadge value={school.rating} count={reviews.length} />
                <ShareButtons path={`/schools/${school.slug}`} title={`${school.name} Soccer — SoccerDadHQ`} />
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              {school.website && (
                <a href={school.website} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  School site
                </a>
              )}
              <Link href={`/schools/${school.slug}#reviews`} className="btn-outline text-sm">
                Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {/* Tryouts — owner-managed */}
            {(school as { tryouts_open?: boolean }).tryouts_open && (
              <div className="card border-l-4 border-brand-amber p-4">
                <h3 className="label text-amber-700">Tryouts</h3>
                {(school as { next_tryout_date?: string }).next_tryout_date && (
                  <p className="text-sm font-semibold text-navy">
                    Next date:{" "}
                    {new Date(`${(school as { next_tryout_date?: string }).next_tryout_date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                {(school as { tryout_note?: string }).tryout_note && (
                  <p className="mt-1 text-sm text-slate-700">{(school as { tryout_note?: string }).tryout_note}</p>
                )}
              </div>
            )}

            {/* Quick stats */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { n: school.state_titles, l: "State titles" },
                { n: school.district_titles, l: "District titles" },
                { n: school.programs.length === 2 ? "B + G" : school.programs[0], l: "Programs" },
                { n: school.enrollment.toLocaleString(), l: "Enrollment" },
              ].map((s) => (
                <div key={s.l} className="card p-4 text-center">
                  <div className="font-heading text-2xl font-bold text-brand-blue">{s.n}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{s.l}</div>
                </div>
              ))}
            </section>

            <section>
              <h2 className="section-title mb-3">About the Program</h2>
              <p className="leading-relaxed text-slate-700">{school.description}</p>
              {school.last_title && (
                <p className="mt-2 text-sm text-slate-500">Most recent state title: {school.last_title}.</p>
              )}
            </section>

            {/* Teams / coaches */}
            <section>
              <h2 className="section-title mb-4">Teams &amp; Coaches</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {school.programs.includes("Boys") && (
                  <div className="card p-4">
                    <h3 className="label">Boys Varsity</h3>
                    <p className="font-heading text-lg font-bold text-navy">{school.head_coach_boys}</p>
                    <p className="text-sm text-slate-500">Head Coach · {school.district}</p>
                  </div>
                )}
                {school.programs.includes("Girls") && (
                  <div className="card p-4">
                    <h3 className="label">Girls Varsity</h3>
                    <p className="font-heading text-lg font-bold text-navy">{school.head_coach_girls}</p>
                    <p className="text-sm text-slate-500">Head Coach · {school.district}</p>
                  </div>
                )}
              </div>
              <div className="mt-3 card border-l-4 border-brand-amber p-4">
                <h3 className="label text-amber-700">Schedule &amp; Standings</h3>
                <p className="text-sm text-slate-600">
                  Full FHSAA schedule, district standings and playoff results are published on the school
                  athletics site each season.
                </p>
              </div>
            </section>

            {/* Commitments — a Featured profile benefit */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">College &amp; Pro Commitments</h2>
                {tier !== "unclaimed" && (
                  <CommitmentForm subjectType="school" subjectSlug={school.slug} subjectName={school.name} />
                )}
              </div>
              {tier === "unclaimed" ? (
                <div className="card border-2 border-dashed border-slate-200 p-6 text-center">
                  <p className="font-heading text-lg font-bold text-navy">Showcase where your players go</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Announcing college, pro &amp; national-team commitments is a Claim &amp; Featured profile benefit.
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

            <section>
              <h2 className="section-title mb-4">Rating Breakdown</h2>
              <div className="card p-6">
                <CategoryScores categories={SCHOOL_REVIEW_CATEGORIES} scores={school.scores as unknown as Record<string, number>} />
              </div>
            </section>

            <section id="reviews" className="scroll-mt-20">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Parent &amp; Player Reviews</h2>
                <span className="text-sm text-slate-500">{reviews.length} total</span>
              </div>
              <div className="mb-6">
                <ReviewForm
                  subjectType="school"
                  subjectId={school.id}
                  subjectName={school.name}
                  categories={SCHOOL_REVIEW_CATEGORIES}
                />
              </div>
              <ReviewList reviews={reviews} categories={SCHOOL_REVIEW_CATEGORIES} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            {rankInfo && (
              <RankBadgeShare
                name={school.name}
                profileUrl={`${SITE_URL}/schools/${school.slug}`}
                period={rankingPeriod}
                categoryLabel="Schools"
                regionName={regionName(school.region)}
                rank={rankInfo.rank}
                regionRank={rankInfo.regionRank}
                regionTotal={rankInfo.regionTotal}
                votes={rankInfo.votes}
                programLabel={rankInfo.programLabel}
              />
            )}
            <div className="card p-5">
              <h3 className="mb-3 font-heading text-lg font-bold uppercase text-navy">Details</h3>
              <ul className="space-y-2.5 text-sm">
                <li className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-semibold text-navy">{school.type}</span></li>
                <li className="flex justify-between"><span className="text-slate-500">FHSAA Class</span><span className="font-semibold text-navy">{school.fhsaa_class}</span></li>
                <li className="flex justify-between"><span className="text-slate-500">District</span><span className="font-semibold text-navy">{school.district}</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Region</span><span className="font-semibold text-navy">{regionName(school.region)}</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-semibold text-navy">{school.city}, FL</span></li>
              </ul>
            </div>

            <MapEmbed lat={school.lat} lng={school.lng} label={school.name} city={school.city} zip={school.zip} />

            <LogoManager subjectType="school" slug={school.slug} currentLogo={logo} />

            <ClaimPanel tier={tier} subjectType="school" slug={school.slug} name={school.name} label="program" perk="post results" />

            <TryoutAlertSignup region={school.region} regionName={regionName(school.region)} />

            {tier === "unclaimed" && <AdSlot placement="profile-sidebar" seed={school.name.length} />}
          </div>
        </div>

        <section className="mt-14">
          <h2 className="section-title mb-4">Nearby Schools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((s) => (
              <SchoolCard key={s.id} school={s} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
