import { TRYOUTS } from "./seed";
import { COMMITMENTS } from "./commitments";
import { RANKED_CLUBS } from "./rankings";
import { getNews } from "./news";
import { resolveAd } from "./ads";
import { getAdsConfig } from "./adsServer";
import { FUN_POLLS, pollOfTheWeekIndex } from "./funPolls";
import { getInsightOfTheWeek } from "./pollResults";
import { regionName, type RegionKey } from "./regions";
import { formatDate, SITE_URL } from "./utils";
import { sendEmail } from "./email";
import { unsubUrl, UNSUB_PLACEHOLDER } from "./unsubscribe";

/**
 * Builds a region-tailored "The Sideline" issue. Leads with platform data that is
 * ALWAYS relevant (open tryouts, top clubs, recent commitments in the region),
 * then geo-matched news, with statewide stories as fallback. Region-agnostic
 * (pass null) produces the statewide edition.
 */
export async function buildRegionDigest(region?: RegionKey | null) {
  const label = region ? regionName(region) : "Florida";
  const now = Date.now();

  const tryouts = TRYOUTS.filter((t) => +new Date(t.date) > now)
    .filter((t) => !region || t.region === region)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 5);

  const topClubs = RANKED_CLUBS.filter((c) => !region || c.region === region).slice(0, 5);

  const commits = COMMITMENTS.filter((c) => !region || c.region === region).slice(0, 5);

  const allNews = await getNews();
  const regionNews = region ? allNews.filter((n) => n.region === region) : [];
  const news = (regionNews.length >= 3 ? regionNews : allNews).slice(0, 5);

  const sponsor = resolveAd(await getAdsConfig(), "newsletter", 4);
  const poll = FUN_POLLS[pollOfTheWeekIndex()];
  const insight = await getInsightOfTheWeek();
  const insightTop = insight.options[insight.topIndex];

  const subject = region
    ? `The Sideline — ${label}: tryouts, top clubs & commitments`
    : `The Sideline — this week in Florida youth soccer`;

  /* ---------- plain text ---------- */
  const text = `THE SIDELINE — ${label} edition
${SITE_URL}

${tryouts.length ? `OPEN TRYOUTS
${tryouts.map((t) => `• ${t.club_name} — ${t.age_groups} (${t.gender}) — ${formatDate(t.date)} — ${t.city}`).join("\n")}` : ""}

TOP CLUBS ${region ? `IN ${label.toUpperCase()}` : ""}
${topClubs.map((c, i) => `${i + 1}. ${c.name} — ${c.subtitle}`).join("\n")}

${commits.length ? `RECENT COMMITMENTS
${commits.map((c) => `• ${c.player_name} (${c.position}, '${String(c.grad_year).slice(2)}) → ${c.destination}${c.club_name ? ` — ${c.club_name}` : ""}`).join("\n")}` : ""}

FROM THE NEWS
${news.map((n) => `• ${n.title} (${n.source}) — ${n.link}`).join("\n")}

PARENT PULSE — WHAT FLORIDA SOCCER PARENTS SAY
${insight.poll.emoji} ${insight.poll.question}
Leading answer: ${insightTop.label} (${insightTop.pct}%)
${insight.options.map((o) => `  – ${o.label}: ${o.pct}%`).join("\n")}
Add your vote → ${SITE_URL}/sideline

SIDELINE LIFE — FUN POLL OF THE WEEK
${poll.emoji} ${poll.question}
${poll.options.map((o) => `  – ${o.label}`).join("\n")}
Vote → ${SITE_URL}/sideline

— — —
${sponsor.house ? "SPONSOR THE SIDELINE" : "PRESENTED BY " + sponsor.advertiser.toUpperCase()}: ${sponsor.headline} → ${SITE_URL}/advertise

SoccerDadHQ, a True North Trading company · Doral, FL 33178
Unsubscribe: ${UNSUB_PLACEHOLDER}`;

  /* ---------- html ---------- */
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
            `<div style="padding:6px 0;font-size:14px"><strong style="color:#0a1628">${c.player_name}</strong> <span style="color:#64748b">(${c.position}, Class of ${c.grad_year})</span> → <strong style="color:#1d7a4d">${c.destination}</strong></div>`
        )
        .join("")
    : "";

  const newsHtml = news
    .map(
      (n) =>
        `<div style="padding:8px 0;border-bottom:1px solid #f1f5f9"><a href="${n.link}" style="color:#0a1628;text-decoration:none;font-weight:600">${n.title}</a><div style="color:#94a3b8;font-size:12px">${n.source}</div></div>`
    )
    .join("");

  // Parent Pulse — the serious insight poll of the week, with live result bars.
  const pulseBars = insight.options
    .map((o, i) => {
      const lead = i === insight.topIndex;
      return `<div style="margin:7px 0">
        <div style="font-size:13px;color:#0a1628;font-weight:${lead ? 700 : 500}">${o.label} <span style="color:#1a4fa0;font-weight:700">${o.pct}%</span></div>
        <div style="height:8px;background:#f1f5f9;border-radius:6px;overflow:hidden;margin-top:3px"><div style="height:8px;width:${o.pct}%;background:${lead ? "#e8a020" : "#2a7de1"}"></div></div>
      </div>`;
    })
    .join("");

  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0a1628">
  <div style="background:#0a1628;border-radius:14px 14px 0 0;padding:24px 28px">
    <div style="font-size:22px;font-weight:700;color:#fff">Soccer<span style="color:#2a7de1">Dad</span>HQ</div>
    <div style="font-size:13px;letter-spacing:2px;color:#e8a020;text-transform:uppercase;margin-top:2px">The Sideline · ${label}</div>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:8px 28px 28px">
    ${section("Open Tryouts", tryoutsHtml)}
    ${section(`Top Clubs${region ? ` in ${label}` : ""}`, clubsHtml)}
    ${section("Recent Commitments", commitsHtml)}
    ${section("From the News", newsHtml)}

    <!-- Parent Pulse: serious insight poll of the week, with results -->
    <div style="margin-top:24px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <div style="background:#0a1628;padding:10px 16px">
        <span style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#e8a020;font-weight:700">📊 Parent Pulse · What FL soccer parents say</span>
      </div>
      <div style="padding:14px 16px">
        <div style="font-size:16px;font-weight:700;color:#0a1628">${insight.poll.emoji} ${insight.poll.question}</div>
        <div style="margin-top:10px">${pulseBars}</div>
        <a href="${SITE_URL}/sideline" style="font-size:13px;font-weight:700;color:#1a4fa0;text-decoration:none;display:inline-block;margin-top:8px">Add your vote →</a>
      </div>
    </div>

    <!-- Fun poll of the week -->
    <a href="${SITE_URL}/sideline" style="display:block;text-decoration:none;margin-top:24px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <div style="background:linear-gradient(120deg,#1a4fa0,#0a1628);padding:10px 16px">
        <span style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#e8a020;font-weight:700">🎉 Sideline Life · Fun poll of the week</span>
      </div>
      <div style="padding:14px 16px">
        <div style="font-size:16px;font-weight:700;color:#0a1628">${poll.emoji} ${poll.question}</div>
        <div style="font-size:13px;color:#475569;margin-top:6px">${poll.options.map((o) => o.label).join(" · ")}</div>
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

  return { subject, text, html, region: region ?? null, label };
}

/** Swaps the per-recipient unsubscribe link into a built digest. */
function personalize(digest: { html: string; text: string }, email: string) {
  const url = unsubUrl(email);
  return {
    html: digest.html.split(UNSUB_PLACEHOLDER).join(url),
    text: digest.text.split(UNSUB_PLACEHOLDER).join(url),
  };
}

/** Sends a built digest via Resend (no-op when RESEND_API_KEY isn't set). */
export async function sendDigest(email: string, region?: RegionKey | null) {
  const digest = await buildRegionDigest(region);
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
