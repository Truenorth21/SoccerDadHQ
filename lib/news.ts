import { XMLParser } from "fast-xml-parser";
import type { NewsItem } from "./types";
import { CLUBS } from "./seed";
import { ALL_REGIONS, REGION_MAP, type RegionKey } from "./regions";
import { US_STATES } from "./states";

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

/* News sources. Each is an RSS feed: either a publisher's own feed (`feed`) or a
 * Google News RSS search (`query`). Google News reliably indexes the youth-soccer
 * publishers (Top Drawer Soccer, ECNL, SoccerWire, Soccer America…) whose own feeds
 * are dead or bot-blocked, so `site:` queries pin those sources. A source with both
 * tries its own feed first and falls back to the Google News query when that comes
 * back empty. National sources run alongside the original Florida ones. */
interface NewsSource {
  name: string; // publisher label shown when the feed doesn't name one
  scope: "national" | "florida";
  feed?: string; // the publisher's own RSS/Atom feed
  query?: string; // Google News RSS search
}

const NEWS_SOURCES: NewsSource[] = [
  // ---- National ----
  { name: "Top Drawer Soccer", scope: "national", query: "site:topdrawersoccer.com" },
  { name: "College Soccer News", scope: "national", feed: "https://www.collegesoccernews.com/feed/", query: "site:collegesoccernews.com" },
  { name: "Soccer America", scope: "national", query: "site:socceramerica.com youth OR college OR ECNL OR \"MLS NEXT\" OR \"Girls Academy\"" },
  { name: "ECNL", scope: "national", query: "site:theecnl.com OR \"Elite Clubs National League\"" },
  { name: "SoccerWire", scope: "national", query: "site:soccerwire.com" },
  { name: "Google News", scope: "national", query: '"ECNL" OR "MLS NEXT" OR "Girls Academy" youth soccer' },
  { name: "Google News", scope: "national", query: "youth soccer college commitment OR recruiting" },
  // ---- Florida ----
  { name: "Google News", scope: "florida", query: 'florida (youth OR club OR "high school") soccer' },
  { name: "Google News", scope: "florida", query: "florida soccer college commitment OR recruiting" },
  { name: "Google News", scope: "florida", query: "florida high school soccer state championship OR FHSAA" },
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
  // Texas
  "tx-dfw": ["dfw", "dallas", "fort worth", "frisco", "plano", "arlington", "north texas"],
  "tx-houston": ["houston", "katy", "sugar land", "the woodlands", "pearland"],
  "tx-austin-san-antonio": ["austin", "round rock", "san marcos", "central texas"],
  "tx-san-antonio": ["san antonio", "new braunfels"],
  "tx-west-texas": ["west texas", "el paso", "lubbock", "midland", "odessa", "amarillo"],
  // Georgia
  "ga-atlanta-metro": ["atlanta", "gwinnett", "cobb county", "alpharetta", "marietta"],
  "ga-north-georgia": ["north georgia", "athens, ga", "dalton", "rome, ga"],
  "ga-savannah-coastal": ["savannah", "brunswick", "golden isles", "coastal georgia"],
  "ga-middle-georgia": ["middle georgia", "macon", "warner robins", "columbus, ga"],
  // North Carolina
  "nc-charlotte": ["charlotte", "lake norman", "gastonia"],
  "nc-triangle": ["raleigh", "durham", "chapel hill", "cary", "research triangle"],
  "nc-triad": ["greensboro", "winston-salem", "high point", "piedmont triad"],
  "nc-wilmington": ["wilmington, nc", "cape fear"],
  // South Carolina
  "sc-charleston": ["charleston", "mount pleasant", "lowcountry", "summerville"],
  "sc-columbia": ["columbia, sc", "lexington, sc", "midlands"],
  "sc-greenville-upstate": ["greenville, sc", "spartanburg", "upstate south carolina", "clemson"],
  // Tennessee
  "tn-nashville": ["nashville", "franklin, tn", "murfreesboro", "middle tennessee"],
  "tn-memphis": ["memphis", "germantown", "collierville"],
  "tn-knoxville": ["knoxville", "east tennessee", "maryville"],
  "tn-chattanooga": ["chattanooga"],
  // California
  "ca-la-socal": ["los angeles", "southern california", "socal", "orange county", "inland empire"],
  "ca-bay-area-norcal": ["bay area", "san francisco", "san jose", "oakland", "norcal"],
  "ca-san-diego": ["san diego"],
  "ca-sacramento": ["sacramento"],
  "ca-central-valley": ["central valley", "fresno", "modesto", "bakersfield"],
  // New York
  "ny-nyc-metro": ["new york city", "nyc", "brooklyn", "queens", "the bronx", "staten island", "westchester"],
  "ny-long-island": ["long island", "nassau county", "suffolk county"],
  "ny-hudson-valley": ["hudson valley", "rockland county", "dutchess county"],
  "ny-upstate-ny": ["upstate new york", "albany", "syracuse", "rochester, ny", "buffalo"],
  // New Jersey
  "nj-north-nj": ["north jersey", "bergen county", "morris county"],
  "nj-central-nj": ["central jersey", "monmouth county", "middlesex county"],
  "nj-south-nj": ["south jersey", "camden county", "cherry hill"],
  // Virginia
  "va-northern-va-dc-metro": ["northern virginia", "nova", "fairfax", "loudoun", "arlington, va"],
  "va-richmond": ["richmond, va", "henrico", "chesterfield county"],
  "va-hampton-roads": ["hampton roads", "virginia beach", "norfolk", "chesapeake"],
  "va-shenandoah-valley": ["shenandoah valley", "harrisonburg", "winchester, va"],
  // Illinois
  "il-chicagoland": ["chicago", "chicagoland", "naperville"],
  "il-central-il": ["central illinois", "springfield, il", "peoria", "champaign"],
  "il-southern-il": ["southern illinois", "carbondale", "metro east"],
  // Florida
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
  for (const r of ALL_REGIONS) kws.set(r.key, new Set(REGION_SYNONYMS[r.key] ?? []));
  // City names only for Florida clubs: national cities like "Columbia" or "Jackson"
  // are too ambiguous, so those regions rely on the curated synonyms above.
  for (const c of CLUBS) if (c.state === "FL") kws.get(c.region)?.add(c.city.toLowerCase());
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

// Full state names, longest first so "West Virginia" wins over "Virginia".
const STATE_MATCHERS = [...US_STATES]
  .sort((a, b) => b.name.length - a.name.length)
  .map((s) => ({ re: new RegExp(`\\b${s.name}\\b`, "i"), code: s.code }));

/** State a story is about: its detected region's state, else a state named in the text. */
function detectState(text: string, region?: RegionKey): string | undefined {
  if (region && REGION_MAP[region]) return REGION_MAP[region].state;
  return STATE_MATCHERS.find(({ re }) => re.test(text))?.code;
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

function googleNewsUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

/** Fetch one source: its own feed first, then its Google News query if the feed is empty. */
async function fetchSource(src: NewsSource): Promise<NewsItem[]> {
  if (src.feed) {
    const direct = await fetchFeed(src.feed, src.name);
    if (direct.length || !src.query) return direct;
  }
  return src.query ? fetchFeed(googleNewsUrl(src.query), src.name) : [];
}

/** Fetch + parse one RSS (or Atom) feed into clean NewsItems. */
async function fetchFeed(url: string, fallbackSource: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      next: { revalidate: 1800 }, // 30 min ISR cache
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const data = parser.parse(xml);
    const items = asArray(data?.rss?.channel?.item ?? data?.feed?.entry);

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
      const pub = item.pubDate ?? item.published ?? item.updated ?? new Date(Date.UTC(2026, 4, 31)).toISOString();
      const descRaw = stripHtml(String(item.description ?? item.summary?.["#text"] ?? item.summary ?? ""));
      const excerpt = descRaw && normKey(descRaw) !== normKey(title) ? descRaw.slice(0, 220) : "";

      out.push({
        id: `gn-${slug(title)}-${i}`,
        title,
        link,
        source: source || fallbackSource,
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
    title: "ECNL releases 2026–27 schedule and showcase dates",
    link: "https://www.theecnl.com",
    source: "ECNL",
    category: "ECNL",
    excerpt: "The Elite Clubs National League has published its conference schedule and national event calendar, with showcases across the country on the docket for the coming season.",
    published: new Date(Date.UTC(2026, 4, 29)).toISOString(),
  },
  {
    id: "fb-2",
    title: "MLS NEXT expands its footprint for the upcoming season",
    link: "https://www.mlssoccer.com/mlsnext",
    source: "MLS NEXT",
    category: "MLS NEXT",
    excerpt: "New academies have been added to the MLS NEXT platform, deepening the boys' elite pathway in fast-growing markets from Texas to the Carolinas.",
    published: new Date(Date.UTC(2026, 4, 28)).toISOString(),
  },
  {
    id: "fb-3",
    title: "Girls Academy League announces member clubs for 2026",
    link: "https://girlsacademyleague.com",
    source: "Girls Academy",
    category: "Girls Academy",
    excerpt: "The GA continues its growth with a refreshed slate of member clubs across its regional conferences.",
    published: new Date(Date.UTC(2026, 4, 27)).toISOString(),
  },
  {
    id: "fb-4",
    title: "Youth clubs send record number of commits in latest recruiting cycle",
    link: "https://www.topdrawersoccer.com",
    source: "TopDrawerSoccer",
    category: "Recruiting",
    excerpt: "College coaches continue to mine the club pathway, with a record number of Division I commitments this cycle.",
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
    excerpt: "As fees and travel demands climb, a growing number of families are questioning whether the elite pathway is worth the cost.",
    published: new Date(Date.UTC(2026, 4, 23)).toISOString(),
  },
  {
    id: "fb-8",
    title: "Girls clubs shine at national finals",
    link: "https://www.topdrawersoccer.com",
    source: "TopDrawerSoccer",
    category: "Girls Soccer",
    excerpt: "Clubs from across the country advanced deep into national bracket play on the girls' side.",
    published: new Date(Date.UTC(2026, 4, 22)).toISOString(),
  },
];

export async function getNews(): Promise<NewsItem[]> {
  const results = await Promise.all(NEWS_SOURCES.map(fetchSource));
  let all = results.flat();

  // De-dupe by normalized title (queries overlap, esp. site: vs topical).
  const seen = new Set<string>();
  all = all.filter((n) => {
    const k = normKey(n.title);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Geo-tag each story to a region and/or state when its text names one.
  all = all.map((n) => {
    const text = `${n.title} ${n.excerpt}`;
    const region = n.region ?? detectRegion(text);
    return { ...n, region, state: n.state ?? detectState(text, region) };
  });

  // Newest first.
  all.sort((a, b) => +new Date(b.published) - +new Date(a.published));

  // If the live fetch came up short (offline build, Google hiccup), top up.
  if (all.length < 6) all = [...all, ...FALLBACK];

  return all;
}
