import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

// Bulk scrapers / SEO-tool crawlers that hammer thousands of directory pages
// without sending visitors. Blocking them keeps the site inside free hosting limits.
// (Google, Bing and AI *search* bots that do send traffic stay allowed.)
const HEAVY_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "Amazonbot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
  "DataForSeoBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api/"] },
      { userAgent: HEAVY_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
