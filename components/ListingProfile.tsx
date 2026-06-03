import Link from "next/link";
import { notFound } from "next/navigation";
import Crest, { GradientPanel } from "./Crest";
import { RatingBadge } from "./Stars";
import CategoryScores from "./CategoryScores";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import ClaimForm from "./ClaimForm";
import Breadcrumbs from "./Breadcrumbs";
import MapEmbed from "./MapEmbed";
import AdSlot from "./AdSlot";
import ShareButtons from "./ShareButtons";
import ListingCard from "./ListingCard";
import { getListingBySlug, getNearbyListings, KIND_CONFIG, type ListingKind } from "@/lib/listings";
import { getSupabaseReviews } from "@/lib/data";
import { regionName } from "@/lib/regions";

export default async function ListingProfile({ kind, slug }: { kind: ListingKind; slug: string }) {
  const l = getListingBySlug(kind, slug);
  if (!l) notFound();
  const cfg = KIND_CONFIG[kind];
  const extra = await getSupabaseReviews(kind, l.id);
  const reviews = [...extra, ...l.reviews];
  const nearby = getNearbyListings(l, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: l.name,
    description: l.description,
    address: { "@type": "PostalAddress", addressLocality: l.city, addressRegion: "FL", postalCode: l.zip, addressCountry: "US" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: l.rating.toFixed(1), reviewCount: l.review_count, bestRating: "5", worstRating: "1" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: cfg.plural, href: cfg.path }, { label: l.name }]} />

      <div className="relative">
        <GradientPanel seed={l.slug} color={l.color} className="h-40 w-full sm:h-56" />
        <div className="container-page">
          <div className="relative -mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end">
            <div className="rounded-2xl bg-white p-2 shadow-card-hover">
              <Crest name={l.name} color={l.color} size="xl" />
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-navy sm:text-4xl">{l.name}</h1>
                <span className="chip-sky">{cfg.label}</span>
                {l.verified && <span className="chip-sky">✓ Verified</span>}
              </div>
              <p className="mt-1 text-slate-600">{l.city}, FL · {regionName(l.region)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <RatingBadge value={l.rating} count={reviews.length} />
                <ShareButtons path={`${cfg.path}/${l.slug}`} title={`${l.name} — SoccerDadHQ`} />
              </div>
            </div>
            {l.website && (
              <div className="pb-2">
                <a href={l.website} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">Visit website</a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <section>
              <h2 className="section-title mb-3">About</h2>
              <p className="leading-relaxed text-slate-700">{l.description}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {l.facts.map((f) => (
                  <div key={f.label} className="card p-4">
                    <h3 className="label">{f.label}</h3>
                    <p className="font-heading text-lg font-bold text-navy">{f.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="section-title mb-4">Rating Breakdown</h2>
              <div className="card p-6">
                <CategoryScores categories={cfg.reviewCats} scores={l.scores} />
              </div>
            </section>

            <section id="reviews" className="scroll-mt-20">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Reviews</h2>
                <span className="text-sm text-slate-500">{reviews.length} total</span>
              </div>
              <div className="mb-6">
                <ReviewForm subjectType={kind} subjectId={l.id} subjectName={l.name} categories={cfg.reviewCats} />
              </div>
              <ReviewList reviews={reviews} categories={cfg.reviewCats} />
            </section>
          </div>

          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <h3 className="mb-3 font-heading text-lg font-bold uppercase text-navy">Contact</h3>
              <ul className="space-y-2.5 text-sm">
                {l.website && <li className="flex gap-2"><span className="text-slate-400">🌐</span><a href={l.website} target="_blank" rel="noopener noreferrer" className="truncate text-brand-blue hover:underline">{l.website.replace(/^https?:\/\//, "")}</a></li>}
                {l.email && <li className="flex gap-2"><span className="text-slate-400">✉️</span><a href={`mailto:${l.email}`} className="truncate text-brand-blue hover:underline">{l.email}</a></li>}
                {l.phone && <li className="flex gap-2"><span className="text-slate-400">📞</span><span className="text-navy">{l.phone}</span></li>}
                <li className="flex gap-2"><span className="text-slate-400">📍</span><span className="text-navy">{l.city}, FL {l.zip}</span></li>
              </ul>
            </div>

            <MapEmbed lat={l.lat} lng={l.lng} label={l.name} city={l.city} zip={l.zip} />

            <div className="card border-2 border-dashed border-slate-200 p-5 text-center">
              <h3 className="font-heading text-lg font-bold text-navy">{l.claimed ? `This ${cfg.label.toLowerCase()} is claimed` : `Is this your ${cfg.label.toLowerCase()}?`}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {l.claimed ? "A representative manages this profile." : "Claim it to update info, respond to reviews and stand out."}
              </p>
              {!l.claimed && (
                <div className="mt-3">
                  <ClaimForm subjectType={kind} subjectSlug={l.slug} subjectName={l.name} />
                  <Link href="/advertise#tiers" className="mt-2 inline-block text-xs font-semibold text-brand-blue hover:underline">Compare Free, Claim & Featured →</Link>
                </div>
              )}
            </div>

            {!l.featured && <AdSlot placement="profile-sidebar" seed={l.name.length} />}
          </div>
        </div>

        <section className="mt-14">
          <h2 className="section-title mb-4">Nearby {cfg.plural}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((x) => (
              <ListingCard key={x.id} listing={x} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
