import { getRankings } from "./rankings";
import { getActiveTryouts } from "./data";
import { getNews } from "./news";
import { resolveAd } from "./ads";
import { getAdsConfig } from "./adsServer";
import { getInsightOfTheWeek, getFunPollOfTheWeek } from "./pollResults";
import { POLL_REVEAL_THRESHOLD } from "./funPolls";
import { regionName, regionState, type RegionKey } from "./regions";
import { stateByCode, stateName } from "./states";
import { formatDate, SITE_URL } from "./utils";
import { sendEmail } from "./email";
import { unsubUrl, UNSUB_PLACEHOLDER } from "./unsubscribe";
import { publicClient } from "./supabase/public";

/** Admin-written "this week" intro, edited at /admin/newsletter (site_config key 'newsletter'). */
async function getNewsletterIntro(): Promise<string> {
  const supabase = publicClient();
  if (!supabase) return "";
  try {
    const { data } = await supabase.from("site_config").select("value").eq("key", "newsletter").single();
    return ((data?.value as { intro?: string } | null)?.intro ?? "").trim();
  } catch {
    return "";
  }
}

type DigestCommit = { player_name: string; position: string; grad_year: number | null; destination: string; club_name: string };

/** Real, published commitment announcements for a state (newest first). The
 *  generated sample players on the site never go out in an email. */
async function getStateCommitments(state: string, limit = 5): Promise<DigestCommit[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("commitments")
      .select("player_name, position, grad_year, destination, subject_name")
      .eq("status", "published")
      .eq("state", state)
      .order("created_at", { ascending: false })
      .limit(limit);
    return ((data ?? []) as { player_name: string; position: string | null; grad_year: number | null; destination: string; subject_name: string | null }[]).map((c) => ({
      player_name: c.player_name,
      position: c.position ?? "",
      grad_year: c.grad_year,
      destination: c.destination,
      club_name: c.subject_name ?? "",
    }));
  } catch {
    return [];
  }
}

/**
 * Builds a "The Sideline" issue for one state, optionally narrowed to one of its
 * regions. Leads with platform data that is ALWAYS relevant (open tryouts, top
 * clubs, real commitments in the state), then geo-matched news: region stories,
 * then the state's stories, then national. With no region, it's the state-wide
 * edition. `state` defaults to the region's state, else Florida (the original
 * single-state list).
 */
export async function buildRegionDigest(region?: RegionKey | null, state?: string | null) {
  const st = stateByCode(state)?.code ?? (region ? regionState(region) : undefined) ?? "FL";
  if (region && regionState(region) !== st) region = null;
  const stName = stateName(st);
  const label = region ? regionName(region) : stName;

  const tryouts = (await getActiveTryouts())
    .filter((t) => (t.state || "FL") === st && (!region || t.region === region))
    .slice(0, 5);

  const stateClubs = (await getRankings()).clubs.filter((c) => (c.state || "FL") === st);
  let topClubs = region ? stateClubs.filter((c) => c.region === region) : stateClubs;
  let clubsHeading = `Top Clubs in ${label}`;
  if (topClubs.length < 3) {
    topClubs = stateClubs;
    clubsHeading = `Top Clubs in ${stName}`;
  }
  topClubs = topClubs.slice(0, 5);

  const commits = await getStateCommitments(st);

  // News: prefer this region's stories, then the state's, then national, and
  // label the section honestly so a Texas edition never presents Florida news
  // as if it were local.
  const allNews = await getNews();
  const stateNews = allNews.filter((n) => n.state === st);
  const regionNews = region ? stateNews.filter((n) => n.region === region) : stateNews;
  let news = regionNews;
  let newsHeading = region ? `News in ${label}` : `${stName} News`;
  if (news.length < 2) {
    const rest = stateNews.filter((n) => !regionNews.includes(n));
    news = [...regionNews, ...rest];
    newsHeading = `${stName} News`;
  }
  if (news.length < 2) {
    news = allNews;
    newsHeading = "Around U.S. Youth Soccer";
  }
  news = news.slice(0, 5);

  // Region-aware sponsor: a creative tagged with this region (or untagged) fills the slot.
  const sponsor = resolveAd(await getAdsConfig(), "newsletter", 4, region ?? "statewide");
  const intro = await getNewsletterIntro();
  const fun = await getFunPollOfTheWeek();
  const funTop = fun.options[fun.topIndex];
  const insight = await getInsightOfTheWeek();
  const insightTop = insight.options[insight.topIndex];

  const subject = region
    ? `The Sideline — ${label}: tryouts, top clubs & commitments`
    : `The Sideline — this week in ${stName} youth soccer`;

  /* ---------- plain text ---------- */
  const text = `THE SIDELINE — ${label} edition
${SITE_URL}
${intro ? `\n${intro}\n` : ""}
${tryouts.length ? `OPEN TRYOUTS
${tryouts.map((t) => `• ${t.club_name} — ${t.age_groups} (${t.gender}) — ${formatDate(t.date)} — ${t.city}`).join("\n")}` : ""}

${topClubs.length ? `${clubsHeading.toUpperCase()}
${topClubs.map((c, i) => `${i + 1}. ${c.name} — ${c.subtitle}`).join("\n")}` : ""}

${commits.length ? `RECENT COMMITMENTS
${commits.map((c) => `• ${c.player_name}${c.position || c.grad_year ? ` (${[c.position, c.grad_year ? `'${String(c.grad_year).slice(2)}` : ""].filter(Boolean).join(", ")})` : ""} → ${c.destination}${c.club_name ? ` — ${c.club_name}` : ""}`).join("\n")}` : ""}

${news.length ? `${newsHeading.toUpperCase()}
${news.map((n) => `• ${n.title} (${n.source}) — ${n.link}`).join("\n")}` : ""}

PARENT PULSE — WHAT SOCCER PARENTS SAY
${insight.poll.emoji} ${insight.poll.question}
${insight.revealed ? `Leading answer: ${insightTop.label} (${insightTop.pct}%)
${insight.options.map((o) => `  – ${o.label}: ${o.pct}%`).join("\n")}` : `${insight.options.map((o) => `  – ${o.label}`).join("\n")}
(Be the first to weigh in — results post once ${POLL_REVEAL_THRESHOLD} parents vote.)`}
Add your vote → ${SITE_URL}/sideline

SIDELINE LIFE — FUN POLL OF THE WEEK
${fun.poll.emoji} ${fun.poll.question}
${fun.revealed ? `Leading answer: ${funTop.label} (${funTop.pct}%)
${fun.options.map((o) => `  – ${o.label}: ${o.pct}%`).join("\n")}` : `${fun.options.map((o) => `  – ${o.label}`).join("\n")}
(Be the first to weigh in — results post once ${POLL_REVEAL_THRESHOLD} parents vote.)`}
Vote → ${SITE_URL}/sideline

— — —
${sponsor.house ? "SPONSOR THE SIDELINE" : "PRESENTED BY " + sponsor.advertiser.toUpperCase()}: ${sponsor.headline} → ${SITE_URL}/advertise

SoccerDadHQ, a True North Trading company · Doral, FL 33178
Unsubscribe: ${UNSUB_PLACEHOLDER}`;

  /* ---------- html ---------- */
  // Commitments are user-submitted, so escape them before they go into HTML.
  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const section = (title: string, body: string) =>
    body
      ? `<h2 style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#1a4fa0;margin:24px 0 8px">${title}</h2>${body}`
      : "";

  const tryoutsHtml = tryouts.length
    ? tryouts
        .map(
          (t) =>
            `<div style="padding:8px 0;border-bottom:1px solid #f1f5f9"><a href="${SITE_URL}/clubs/${t.club_slug}" style="color:#0a1628;text-decoration:none;font-weight:700">${t.club_name}</a> <span style="color:#64748b;font-size:13px">— ${t.age_groups} · ${t.gender} · <span style="color:#e8a020;font-weight:700">${formatDate(t.date)}</span> · ${t.city}</span></div>`
        )
        .join("")
    : "";

  const clubsHtml = topClubs
    .map(
      (c, i) =>
        `<div style="padding:6px 0"><span style="color:#94a3b8">${i + 1}.</span> <a href="${SITE_URL}${c.href}" style="color:#0a1628;text-decoration:none;font-weight:700">${c.name}</a> <span style="color:#64748b;font-size:13px">— ${c.subtitle}</span></div>`
    )
    .join("");

  const commitsHtml = commits.length
    ? commits
        .map(
          (c) =>
            `<div style="padding:6px 0;font-size:14px"><strong style="color:#0a1628">${esc(c.player_name)}</strong>${c.position || c.grad_year ? ` <span style="color:#64748b">(${esc([c.position, c.grad_year ? `Class of ${c.grad_year}` : ""].filter(Boolean).join(", "))})</span>` : ""} → <strong style="color:#1d7a4d">${esc(c.destination)}</strong></div>`
        )
        .join("")
    : "";

  const newsHtml = news
    .map(
      (n) =>
        `<div style="padding:8px 0;border-bottom:1px solid #f1f5f9"><a href="${n.link}" style="color:#0a1628;text-decoration:none;font-weight:600">${n.title}</a><div style="color:#94a3b8;font-size:12px">${n.source}</div></div>`
    )
    .join("");

  // Result-bar renderer shared by both polls — lead option in amber, rest in blue.
  const resultBars = (r: typeof insight) =>
    r.options
      .map((o, i) => {
        const lead = i === r.topIndex;
        return `<div style="margin:7px 0">
        <div style="font-size:13px;color:#0a1628;font-weight:${lead ? 700 : 500}">${o.label} <span style="color:#1a4fa0;font-weight:700">${o.pct}%</span></div>
        <div style="height:8px;background:#f1f5f9;border-radius:6px;overflow:hidden;margin-top:3px"><div style="height:8px;width:${o.pct}%;background:${lead ? "#e8a020" : "#2a7de1"}"></div></div>
      </div>`;
      })
      .join("");
  // Poll body: real result bars once enough genuine votes land, otherwise an
  // honest "be the first" call-to-action — never fabricated percentages.
  const pollBody = (r: typeof insight) =>
    r.revealed
      ? `<div style="margin-top:10px">${resultBars(r)}</div><div style="font-size:11px;color:#94a3b8;margin-top:6px">${r.realTotal.toLocaleString()} votes</div>`
      : `<div style="font-size:13px;color:#475569;margin-top:8px">${r.options.map((o) => o.label).join(" · ")}</div><div style="font-size:12px;color:#94a3b8;margin-top:6px">Be the first to weigh in — results post once ${POLL_REVEAL_THRESHOLD} parents vote.</div>`;
  const insightBody = pollBody(insight);
  const funBody = pollBody(fun);

  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0a1628">
  <div style="background:#0a1628;border-radius:14px 14px 0 0;padding:24px 28px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding-right:12px;vertical-align:middle">
        <img src="${SITE_URL}/icon.png" width="46" height="46" alt="SoccerDadHQ" style="display:block;width:46px;height:46px;border-radius:50%;background:#fff;border:0" />
      </td>
      <td style="vertical-align:middle">
        <div style="font-size:22px;font-weight:700;color:#fff;line-height:1.1">Soccer<span style="color:#2a7de1">Dad</span>HQ</div>
        <div style="font-size:13px;letter-spacing:2px;color:#e8a020;text-transform:uppercase;margin-top:3px">The Sideline · ${label}</div>
      </td>
    </tr></table>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:8px 28px 28px">
    ${intro ? `<div style="font-size:15px;line-height:1.6;color:#334155;padding:12px 0 4px;border-bottom:1px solid #f1f5f9">${intro.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</div>` : ""}
    ${section("Open Tryouts", tryoutsHtml)}
    ${section(clubsHeading, clubsHtml)}
    ${section("Recent Commitments", commitsHtml)}
    ${section(newsHeading, newsHtml)}

    <!-- Parent Pulse: serious insight poll of the week, with results -->
    <div style="margin-top:24px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <div style="background:#0a1628;padding:10px 16px">
        <span style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#e8a020;font-weight:700">📊 The Real Talk · What soccer parents say</span>
      </div>
      <div style="padding:14px 16px">
        <div style="font-size:16px;font-weight:700;color:#0a1628">${insight.poll.emoji} ${insight.poll.question}</div>
        ${insightBody}
        <a href="${SITE_URL}/sideline" style="font-size:13px;font-weight:700;color:#1a4fa0;text-decoration:none;display:inline-block;margin-top:8px">Add your vote →</a>
      </div>
    </div>

    <!-- Fun poll of the week -->
    <a href="${SITE_URL}/sideline" style="display:block;text-decoration:none;margin-top:24px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <div style="background:linear-gradient(120deg,#1a4fa0,#0a1628);padding:10px 16px">
        <span style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#e8a020;font-weight:700">🎉 Sideline Life · Fun poll of the week</span>
      </div>
      <div style="padding:14px 16px">
        <div style="font-size:16px;font-weight:700;color:#0a1628">${fun.poll.emoji} ${fun.poll.question}</div>
        ${funBody}
        <div style="font-size:13px;font-weight:700;color:#1a4fa0;margin-top:8px">Cast your vote →</div>
      </div>
    </a>

    <a href="${SITE_URL}/advertise" style="display:block;text-decoration:none;margin-top:24px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <div style="height:5px;background:${sponsor.color}"></div>
      <div style="padding:12px 16px">
        <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#94a3b8">${sponsor.house ? "Sponsor this newsletter" : "Presented by " + sponsor.advertiser}</div>
        <div style="font-size:15px;font-weight:700;color:#0a1628">${sponsor.headline}</div>
        <div style="font-size:13px;color:#475569">${sponsor.body}</div>
      </div>
    </a>

    <p style="font-size:11px;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px">
      You're getting the ${label} edition of The Sideline.<br/>
      SoccerDadHQ, a True North Trading company · Doral, FL 33178 ·
      <a href="${UNSUB_PLACEHOLDER}" style="color:#1a4fa0">Unsubscribe</a>
    </p>
  </div>
</div>`;

  return { subject, text, html, region: region ?? null, state: st, label };
}

/** Swaps the per-recipient unsubscribe link into a built digest. */
export function personalize(digest: { html: string; text: string }, email: string) {
  const url = unsubUrl(email);
  return {
    html: digest.html.split(UNSUB_PLACEHOLDER).join(url),
    text: digest.text.split(UNSUB_PLACEHOLDER).join(url),
  };
}

/** Sends a built digest via Resend (no-op when RESEND_API_KEY isn't set). */
export async function sendDigest(email: string, region?: RegionKey | null, state?: string | null) {
  const digest = await buildRegionDigest(region, state);
  const p = personalize(digest, email);
  const result = await sendEmail({ to: email, subject: digest.subject, html: p.html, text: p.text });
  return { email, ...digest, ...result };
}

/** Sends a prebuilt digest to one recipient (so the cron builds once per region,
 *  then fans out without rebuilding), injecting their unsubscribe link. */
export async function sendBuiltDigest(
  email: string,
  digest: { subject: string; html: string; text: string }
) {
  const p = personalize(digest, email);
  return sendEmail({ to: email, subject: digest.subject, html: p.html, text: p.text });
}
