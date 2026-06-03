import { regionName } from "./regions";
import { getAd, resolveAd, type Ad } from "./ads";
import { getAdsConfig } from "./adsServer";
import { sendEmail } from "./email";
import { unsubUrl } from "./unsubscribe";

const MAILING_ADDRESS = "SoccerDadHQ · [Your business address], Florida";

/**
 * Welcome email for "SoccerDadHQ: The Sideline".
 * Returns subject + plain-text + HTML so it can be handed to any provider
 * (Resend, Postmark, Supabase Auth email, etc.). See sendWelcomeEmail below.
 */
export function buildWelcomeEmail(opts: { email: string; region?: string | null; sponsor?: Ad }) {
  const regionLine = opts.region
    ? `We'll tilt your weekly issue toward ${regionName(opts.region)}, but you'll still get the statewide headlines that matter.`
    : `You'll get the best of Florida youth soccer statewide — pick a region anytime to tailor it.`;

  const sponsor = opts.sponsor ?? getAd("newsletter", 4); // one sponsor per issue
  const unsub = unsubUrl(opts.email);
  const subject = "Welcome to The Sideline ⚽";

  const text = `Welcome to The Sideline — the SoccerDadHQ newsletter.

You're officially on the list. Once a week we'll drop one email with everything a Florida soccer parent actually needs:

  • Tryout alerts before spots fill up
  • Ranking shifts across clubs, coaches and tournaments
  • Recruiting and commitment news
  • The best reads from around the youth game
  • Honest takes for the sideline and the ride home

${regionLine}

No spam, no fluff, and you can unsubscribe with one click anytime.

See you on the sideline,
The SoccerDadHQ Team
https://soccerdadhq.com

— — —
${sponsor.house ? "SPONSOR THE SIDELINE" : "PRESENTED BY " + sponsor.advertiser.toUpperCase()}
${sponsor.headline}: ${sponsor.body} (${sponsor.cta} → https://soccerdadhq.com/advertise)

${MAILING_ADDRESS}
Unsubscribe: ${unsub}`;

  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0a1628">
  <div style="background:#0a1628;border-radius:14px 14px 0 0;padding:28px 32px">
    <div style="font-size:22px;font-weight:700;letter-spacing:.5px;color:#fff">
      Soccer<span style="color:#2a7de1">Dad</span>HQ
    </div>
    <div style="font-size:13px;letter-spacing:2px;color:#e8a020;text-transform:uppercase;margin-top:4px">
      The Sideline
    </div>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:28px 32px">
    <h1 style="font-size:24px;margin:0 0 8px">Welcome to The Sideline ⚽</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155">
      You're officially on the list. Once a week we'll send <strong>one email</strong> with everything a
      Florida soccer parent actually needs:
    </p>
    <ul style="font-size:15px;line-height:1.7;color:#334155;padding-left:20px">
      <li>Tryout alerts before spots fill up</li>
      <li>Ranking shifts across clubs, coaches &amp; tournaments</li>
      <li>Recruiting and commitment news</li>
      <li>The best reads from around the youth game</li>
      <li>Honest takes for the sideline and the ride home</li>
    </ul>
    <p style="font-size:15px;line-height:1.6;color:#334155">${regionLine}</p>
    <p style="font-size:15px;line-height:1.6;color:#334155">
      No spam, no fluff, and you can unsubscribe with one click anytime.
    </p>
    <a href="https://soccerdadhq.com/clubs"
       style="display:inline-block;background:#e8a020;color:#0a1628;font-weight:700;text-decoration:none;
              padding:12px 22px;border-radius:8px;margin-top:8px">
      Explore Florida clubs →
    </a>

    <!-- Newsletter sponsor slot -->
    <a href="https://soccerdadhq.com/advertise" style="display:block;text-decoration:none;margin-top:28px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <div style="height:5px;background:${sponsor.color}"></div>
      <div style="padding:14px 16px">
        <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#94a3b8">
          ${sponsor.house ? "Sponsor this newsletter" : "Presented by " + sponsor.advertiser}
        </div>
        <div style="font-size:15px;font-weight:700;color:#0a1628;margin-top:2px">${sponsor.headline}</div>
        <div style="font-size:13px;color:#475569;margin-top:2px">${sponsor.body}</div>
        <div style="font-size:13px;font-weight:700;color:#1a4fa0;margin-top:6px">${sponsor.cta} →</div>
      </div>
    </a>

    <p style="font-size:13px;color:#94a3b8;margin-top:24px">
      See you on the sideline,<br/>The SoccerDadHQ Team
    </p>
    <p style="font-size:11px;color:#94a3b8;margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px">
      ${MAILING_ADDRESS}<br/>
      You're receiving this because you subscribed at soccerdadhq.com.
      <a href="${unsub}" style="color:#1a4fa0">Unsubscribe</a>.
    </p>
  </div>
</div>`;

  return { subject, text, html };
}

/**
 * Sends the welcome email via Resend (no-op when RESEND_API_KEY isn't set).
 */
export async function sendWelcomeEmail(email: string, region?: string | null) {
  const sponsor = resolveAd(await getAdsConfig(), "newsletter", 4);
  const message = buildWelcomeEmail({ email, region, sponsor });
  const result = await sendEmail({ to: email, subject: message.subject, html: message.html, text: message.text });
  return { ...message, ...result };
}
