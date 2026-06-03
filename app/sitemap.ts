import type { MetadataRoute } from "next";
import { CLUBS, COACHES } from "@/lib/seed";
import { SCHOOLS } from "@/lib/schools";
import { LISTINGS, KIND_CONFIG } from "@/lib/listings";
import { SITE_URL } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/clubs", "/schools", "/coaches", "/training-centers", "/facilities", "/tournaments", "/camps", "/commitments", "/rankings", "/news", "/sideline", "/advertise", "/advertise/order", "/partners", "/privacy", "/terms", "/login"].map((path) => ({
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

  const listingRoutes = LISTINGS.map((l) => ({
    url: `${SITE_URL}${KIND_CONFIG[l.kind].path}/${l.slug}`,
    lastModified: new Date(Date.UTC(2026, 4, 31)),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...clubRoutes, ...coachRoutes, ...schoolRoutes, ...listingRoutes];
}
