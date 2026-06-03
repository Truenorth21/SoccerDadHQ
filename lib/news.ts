import { XMLParser } from "fast-xml-parser";
import type { NewsItem } from "./types";
import { CLUBS } from "./seed";
import { REGIONS, type RegionKey } from "./regions";

export const NEWS_CATEGORIES = [
  "All",
  "ECNL",
  "MLS NEXT",
  "Girls Academy",
  "Girls Soccer",
  "Boys Soccer",
  "High School",
  "Recruiting",
  "Tournaments",
  "Parent Life",
  "Opinion",
] as const;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// We source news through Google News RSS search, which reliably indexes the
// youth-soccer publishers (SoccerWire, TopDrawerSoccer, ECNL, MLS NEXT, Girls
// Academy) whose own feeds are dead or bot-blocked. `site:` queries pin those
// sources; the topical queries broaden coverage and keep it Florida-focused.
const NEWS_QUERIES: string[] = [
  "site:soccerwire.com",
  "site:topdrawersoccer.com",
  'florida (youth OR club OR "high school") soccer',
  '"ECNL" OR "MLS NEXT" OR "Girls Academy" youth soccer',
  "florida soccer college commitment OR recruiting",
  "florida high school soccer state championship OR FHSAA",
];

function categorize(title: string, body: string): string {
  const t = `${title} ${body}`.toLowerCase();
  if (/\bmls next\b|\bmlsnext\b/.test(t)) return "MLS NEXT";
  if (/\becnl\b/.test(t)) return "ECNL";
  if (/girls academy|\bga\b girls|\bgirls academy league\b/.test(t)) return "Girls Academy";
  if (/high school|\bhs\b|fhsaa|varsity|state championship|district final/.test(t)) return "High School";
  if (/\bcommit|recruit|college|signing|national letter|class of 20/.test(t)) return "Recruiting";
  if (/tournament|showcase|cup\b|championship|playoff|final four|state cup/.test(t)) return "Tournaments";
  if (/\bgirls\b|\bwomen|\bwomen's\b|nwsl/.test(t)) return "Girls Soccer";
  if (/\bboys\b|\bmen's\b|\bmls\b/.test(t)) return "Boys Soccer";
  if (/parent|family|sideline|youth development|club soccer cost|burnout/.test(t)) return "Parent Life";
  if (/opinion|column|analysis|perspective|why\b|here's/.test(t)) return "Opinion";
  return "Boys Soccer";
}

// Region synonyms layered on top of the seed-derived city list.
const REGION_SYNONYMS: Record<RegionKey, string[]> = {
  "south-florida": ["south florida", "miami", "broward", "fort lauderdale", "miami-dade", "dade county"],
  "palm-beach-treasure-coast": ["palm beach", "treasure coast", "boca raton", "jupiter", "wellington", "port st. lucie", "vero beach"],
  "southwest-florida": ["southwest florida", "naples", "fort myers", "sarasota", "bradenton", "cape coral", "lakewood ranch"],
  "tampa-bay": ["tampa bay", "tampa", "st. petersburg", "st petersburg", "clearwater", "brandon", "wesley chapel"],
  "orlando-central": ["orlando", "central florida", "lake mary", "winter park", "kissimmee", "sanford", "clermont", "celebration"],
  "space-coast-daytona": ["space coast", "brevard", "melbourne", "cocoa", "daytona", "volusia"],
  "jacksonville-ne": ["jacksonville", "first coast", "st. augustine", "st augustine", "ponte vedra", "northeast florida", "orange park"],
  "north-gainesville": ["gainesville", "ocala", "north central florida"],
  "panhandle-tallahassee": ["panhandle", "tallahassee", "pensacola", "panama city", "emerald coast"],
};

// Build a region keyword matcher from seed club cities + the synonyms above.
const REGION_MATCHERS: { re: RegExp; region: RegionKey }[] = (() => {
  const kws = new Map<RegionKey, Set<string>>();
  for (const r of REGIONS) kws.set(r.key, new Set(REGION_SYNONYMS[r.key]));
  for (const c of CLUBS) kws.get(c.region)?.add(c.city.toLowerCase());
  const list: { re: RegExp; region: RegionKey }[] = [];
  Array.from(kws.entries()).forEach(([region, set]) => {
    Array.from(set).forEach((kw) => {
      const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      list.push({ re: new RegExp(`\\b${esc}\\b`, "i"), region });
    });
  });
  // Longer, more specific phrases first to reduce mis-tagging.
  return list.sort((a, b) => b.re.source.length - a.re.source.length);
})();

function detectRegion(text: string): RegionKey | undefined {
  for (const { re, region } of REGION_MATCHERS) {
    if (re.test(text)) return region;
  }
  return undefined;
}

function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&#039;|&#39;|&rsquo;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray<T>(x: T | T[] | undefined): T[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

function normKey(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 60);
}

/** Fetch + parse one Google News RSS search query into clean NewsItems. */
async function fetchQuery(query: string): Promise<NewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      next: { revalidate: 1800 }, // 30 min ISR cache
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const data = parser.parse(xml);
    const items = asArray(data?.rss?.channel?.item);

    const out: NewsItem[] = [];
    items.slice(0, 12).forEach((item: any, i: number) => {
      let title = stripHtml(String(item.title?.["#text"] ?? item.title ?? ""));

      // Source comes from the <source> element; Google also appends " - Source" to titles.
      const srcRaw = typeof item.source === "object" ? item.source?.["#text"] : item.source;
      let source = stripHtml(String(srcRaw ?? ""));
      const dash = title.lastIndexOf(" - ");
      if (dash > 5) {
        const tail = title.slice(dash + 3).trim();
        if (!source) source = tail;
        if (tail.toLowerCase() === source.toLowerCase()) title = title.slice(0, dash).trim();
      }

      // Skip channel/homepage/junk entries.
      const lower = title.toLowerCase();
      if (!title || title.length < 15) return;
      if (lower === "google news" || /^homepage\b/.test(lower) || lower.endsWith(".com")) return;
      if (/\barchives?$|^category\b|^tag\b/.test(lower)) return; // index/category pages
      if (source && lower === source.toLowerCase()) return;

      const link = typeof item.link === "string" ? item.link : item.link?.["@_href"] ?? "#";
      const pub = item.pubDate ?? item.published ?? new Date(Date.UTC(2026, 4, 31)).toISOString();
      const descRaw = stripHtml(String(item.description ?? ""));
      const excerpt = descRaw && normKey(descRaw) !== normKey(title) ? descRaw.slice(0, 220) : "";

      out.push({
        id: `gn-${slug(title)}-${i}`,
        title,
        link,
        source: source || "Google News",
        category: categorize(title, excerpt),
        excerpt,
        published: new Date(pub).toISOString(),
      });
    });
    return out;
  } catch {
    return [];
  }
}

// Editorial fallback so the page is never empty (e.g. offline build/deploy).
const FALLBACK: NewsItem[] = [
  {
    id: "fb-1",
    title: "ECNL releases 2026–27 Florida schedule and showcase dates",
    link: "https://www.theecnl.com",
    source: "ECNL",
    category: "ECNL",
    excerpt: "The Elite Clubs National League has published its conference schedule and national event calendar, with multiple Florida showcases on the docket for the coming season.",
    published: new Date(Date.UTC(2026, 4, 29)).toISOString(),
  },
  {
    id: "fb-2",
    title: "MLS NEXT expands Florida footprint for upcoming season",
    link: "https://www.mlssoccer.com/mlsnext",
    source: "MLS NEXT",
    category: "MLS NEXT",
    excerpt: "Several Florida academies have been added to the MLS NEXT platform, deepening the boys' elite pathway across the South Florida, Tampa Bay and Orlando regions.",
    published: new Date(Date.UTC(2026, 4, 28)).toISOString(),
  },
  {
    id: "fb-3",
    title: "Girls Academy League announces Florida member clubs for 2026",
    link: "https://girlsacademyleague.com",
    source: "Girls Academy",
    category: "Girls Academy",
    excerpt: "The GA continues its growth in the Sunshine State with a refreshed slate of member clubs competing in the Southeast conference.",
    published: new Date(Date.UTC(2026, 4, 27)).toISOString(),
  },
  {
    id: "fb-4",
    title: "Florida sends record number of commits in latest recruiting cycle",
    link: "https://www.topdrawersoccer.com",
    source: "TopDrawerSoccer",
    category: "Recruiting",
    excerpt: "College coaches continue to mine Florida's deep talent pool, with a record number of Division I commitments from in-state clubs this cycle.",
    published: new Date(Date.UTC(2026, 4, 26)).toISOString(),
  },
  {
    id: "fb-5",
    title: "What parents should actually ask at a club tryout",
    link: "https://www.soccerwire.com",
    source: "SoccerWire",
    category: "Parent Life",
    excerpt: "Beyond the cost and the schedule, here are the questions that reveal whether a club's development promises hold up — and the red flags to watch for.",
    published: new Date(Date.UTC(2026, 4, 25)).toISOString(),
  },
  {
    id: "fb-6",
    title: "Disney Soccer Showcase draws hundreds of teams to Orlando",
    link: "https://www.soccerwire.com",
    source: "SoccerWire",
    category: "Tournaments",
    excerpt: "One of the country's marquee youth events again filled the ESPN Wide World of Sports Complex with elite teams and college scouts.",
    published: new Date(Date.UTC(2026, 4, 24)).toISOString(),
  },
  {
    id: "fb-7",
    title: "Opinion: The travel-soccer arms race is pricing out families",
    link: "https://www.soccerwire.com",
    source: "SoccerWire",
    category: "Opinion",
    excerpt: "As fees and travel demands climb, a growing number of Florida families are questioning whether the elite pathway is worth the cost.",
    published: new Date(Date.UTC(2026, 4, 23)).toISOString(),
  },
  {
    id: "fb-8",
    title: "Florida girls clubs shine at national finals",
    link: "https://www.topdrawersoccer.com",
    source: "TopDrawerSoccer",
    category: "Girls Soccer",
    excerpt: "Multiple Sunshine State sides advanced deep into national bracket play, underscoring the state's strength on the girls' side.",
    published: new Date(Date.UTC(2026, 4, 22)).toISOString(),
  },
];

export async function getNews(): Promise<NewsItem[]> {
  const results = await Promise.all(NEWS_QUERIES.map(fetchQuery));
  let all = results.flat();

  // De-dupe by normalized title (queries overlap, esp. site: vs topical).
  const seen = new Set<string>();
  all = all.filter((n) => {
    const k = normKey(n.title);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Geo-tag each story to a Florida region when its text names one.
  all = all.map((n) => ({ ...n, region: n.region ?? detectRegion(`${n.title} ${n.excerpt}`) }));

  // Newest first.
  all.sort((a, b) => +new Date(b.published) - +new Date(a.published));

  // If the live fetch came up short (offline build, Google hiccup), top up.
  if (all.length < 6) all = [...all, ...FALLBACK];

  return all;
}
