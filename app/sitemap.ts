import type { MetadataRoute } from "next";
import { loadListings, KIND_CONFIG } from "@/lib/listings";
import { loadClubs, loadSchools, loadCoaches } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";
import { US_STATES, stateByCode } from "@/lib/states";
import { ALL_REGIONS } from "@/lib/regions";
import { indexable, loadSeoIndexData } from "@/lib/seoIndex";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const CLUBS = await loadClubs();
  const SCHOOLS = await loadSchools();
  const COACHES = await loadCoaches();
  const staticRoutes = ["", "/clubs", "/schools", "/coaches", "/training-centers", "/facilities", "/tournaments", "/camps", "/commitments", "/rankings", "/tryouts", "/news", "/polls", "/sideline", "/advertise", "/partners", "/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(Date.UTC(2026, 4, 31)),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const clubRoutes = CLUBS.map((c) => ({
    url: `${SITE_URL}/clubs/${c.slug}`,
    lastModified: new Date(Date.UTC(2026, 4, 31)),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const coachRoutes = COACHES.map((c) => ({
    url: `${SITE_URL}/coaches/${c.slug}`,
    lastModified: new Date(Date.UTC(2026, 4, 31)),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const schoolRoutes = SCHOOLS.map((s) => ({
    url: `${SITE_URL}/schools/${s.slug}`,
    lastModified: new Date(Date.UTC(2026, 4, 31)),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const listingRoutes = (await loadListings()).map((l) => ({
    url: `${SITE_URL}${KIND_CONFIG[l.kind].path}/${l.slug}`,
    lastModified: new Date(Date.UTC(2026, 4, 31)),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Programmatic state / region SEO pages — only the ones with listings
  // (empty ones are noindexed, so submitting them would just confuse Google).
  const idx = await loadSeoIndexData();
  const statePaths = US_STATES.flatMap((st) => [
    ...(indexable.clubs(idx, st) ? [`/clubs/${st.slug}`] : []),
    ...(indexable.coaches(idx, st) ? [`/coaches/${st.slug}`] : []),
    ...(indexable.rankings(idx, st) ? [`/rankings/${st.slug}`] : []),
    ...(indexable.tryouts(idx, st) ? [`/tryouts/${st.slug}`] : []),
  ]);
  const regionPaths = ALL_REGIONS.flatMap((r) => {
    const st = stateByCode(r.state)!;
    return indexable.clubs(idx, st, r) ? [`/clubs/${st.slug}/${r.slug}`] : [];
  });
  const seoRoutes = [...statePaths, ...regionPaths].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(Date.UTC(2026, 9, 2)),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...seoRoutes, ...clubRoutes, ...coachRoutes, ...schoolRoutes, ...listingRoutes];
}
