import { sendEmail } from "./email";
import { SITE_URL } from "./utils";

// Where admin alerts (new claims / submissions) are sent. Sent straight to the
// real inbox (not hello@, which forwards) — same-domain mail through a forward
// gets spam-filtered by Gmail, so direct delivery is far more reliable.
const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || "soccerdadhq@gmail.com";

const TYPE_LABEL: Record<string, string> = {
  club: "Club",
  school: "School",
  coach: "Coach",
  "training-center": "Training Center",
  facility: "Facility",
  tournament: "Tournament",
  camp: "Camp",
};

function shell(heading: string, bodyHtml: string): string {
  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0a1628">
  <div style="background:#0a1628;border-radius:14px 14px 0 0;padding:20px 24px">
    <div style="font-size:20px;font-weight:700;color:#fff">Soccer<span style="color:#2a7de1">Dad</span>HQ</div>
    <div style="font-size:12px;letter-spacing:1.5px;color:#e8a020;text-transform:uppercase;margin-top:2px">${heading}</div>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:20px 24px;font-size:14px;line-height:1.55">
    ${bodyHtml}
    <p style="margin-top:18px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px">
      SoccerDadHQ, a True North Trading company · Doral, FL 33178
    </p>
  </div>
</div>`;
}

function row(label: string, val?: string | number | null): string {
  if (val === undefined || val === null || val === "") return "";
  return `<div style="padding:3px 0"><span style="color:#64748b">${label}:</span> <strong style="color:#0a1628">${val}</strong></div>`;
}

export interface ClaimInfo {
  subject_type: string;
  subject_name?: string | null;
  subject_slug?: string;
  claimant_name: string;
  role?: string | null;
  email: string;
  phone?: string | null;
  message?: string | null;
  plan?: string | null;
  plan_price?: number | null;
  promo_code?: string | null;
  referral_code?: string | null;
}

/** (1) admin alert + (2) claimant confirmation on a new profile claim. */
export async function notifyNewClaim(c: ClaimInfo): Promise<void> {
  const typeLabel = TYPE_LABEL[c.subject_type] ?? c.subject_type;
  const who = c.subject_name || c.subject_slug || typeLabel;
  const tier = c.plan === "featured" ? "Featured" : "Claim";
  const priceStr = c.plan_price != null ? ` — $${c.plan_price}/yr` : "";

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New ${typeLabel} claim: ${who}`,
    html: shell(
      "New profile claim",
      `<p>Someone just submitted a claim. Review it in the <a href="${SITE_URL}/admin">admin queue</a>.</p>
       ${row("Profile", `${who} (${typeLabel})`)}
       ${row("Name", c.claimant_name)}
       ${row("Role", c.role)}
       ${row("Email", c.email)}
       ${row("Phone", c.phone)}
       ${row("Plan", `${tier}${priceStr}`)}
       ${row("Promo", c.promo_code)}
       ${row("Referral", c.referral_code)}
       ${c.message ? `<div style="margin-top:8px;padding:8px 10px;background:#f8fafc;border-radius:8px"><em>${c.message}</em></div>` : ""}`
    ),
    text: `New ${typeLabel} claim: ${who}\nName: ${c.claimant_name} (${c.role ?? "—"})\nEmail: ${c.email}\nPhone: ${c.phone ?? "—"}\nPlan: ${tier}${priceStr}\nPromo: ${c.promo_code ?? "—"}  Referral: ${c.referral_code ?? "—"}\nMessage: ${c.message ?? "—"}\nReview: ${SITE_URL}/admin`,
  });

  await sendEmail({
    to: c.email,
    subject: `We received your claim for ${who}`,
    html: shell(
      "Claim received",
      `<p>Hi ${c.claimant_name},</p>
       <p>Thanks for claiming <strong>${who}</strong> on SoccerDadHQ. We've received your request${c.plan_price != null ? ` for the <strong>${tier}</strong> plan ($${c.plan_price}/yr)` : ""}.</p>
       <p><strong>What happens next:</strong> we verify your connection to the program, then send you a secure link to activate. Once active you can edit your profile, respond to reviews, post tryouts and announce commitments.</p>
       <p>Questions? Reply to this email or reach us at hello@soccerdadhq.com.</p>
       <p style="color:#64748b">— The SoccerDadHQ team</p>`
    ),
    text: `Hi ${c.claimant_name},\n\nThanks for claiming ${who} on SoccerDadHQ. We've received your request${c.plan_price != null ? ` for the ${tier} plan ($${c.plan_price}/yr)` : ""}.\n\nWhat happens next: we verify your connection to the program, then send a secure link to activate. Questions? hello@soccerdadhq.com\n\n— The SoccerDadHQ team`,
  });
}

export interface SubmissionInfo {
  kind: string;
  name: string;
  region?: string | null;
  city?: string | null;
  website?: string | null;
  notes?: string | null;
  submitter_email?: string | null;
}

/** (3) admin alert on a new listing submission. */
export async function notifyNewSubmission(s: SubmissionInfo): Promise<void> {
  const typeLabel = TYPE_LABEL[s.kind] ?? s.kind;
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New ${typeLabel} submission: ${s.name}`,
    html: shell(
      "New listing submission",
      `<p>A registered user submitted a new listing. Review it in the <a href="${SITE_URL}/admin">admin queue</a>.</p>
       ${row("Type", typeLabel)}
       ${row("Name", s.name)}
       ${row("Region", s.region)}
       ${row("City", s.city)}
       ${row("Website", s.website)}
       ${row("Submitted by", s.submitter_email)}
       ${s.notes ? `<div style="margin-top:8px;padding:8px 10px;background:#f8fafc;border-radius:8px"><em>${s.notes}</em></div>` : ""}`
    ),
    text: `New ${typeLabel} submission: ${s.name}\nRegion: ${s.region ?? "—"}  City: ${s.city ?? "—"}\nWebsite: ${s.website ?? "—"}\nBy: ${s.submitter_email ?? "—"}\nNotes: ${s.notes ?? "—"}\nReview: ${SITE_URL}/admin`,
  });
}

/** (4) notify the submitter when a claim or submission is approved/activated. */
export async function notifyApproved(table: string, r: Record<string, any>): Promise<void> {
  if (table === "claim_requests") {
    const to = r.email as string | undefined;
    if (!to) return;
    const who = r.subject_name || r.subject_slug || "your profile";
    const active = r.status === "active";
    await sendEmail({
      to,
      subject: active ? `${who} is now active on SoccerDadHQ` : `Your claim for ${who} is approved`,
      html: shell(
        active ? "Profile active" : "Claim approved",
        `<p>Hi ${r.claimant_name ?? "there"},</p>
         <p>Good news — your claim for <strong>${who}</strong> has been ${active ? "activated" : "approved"}.</p>
         ${
           active
             ? `<p>You can now manage the profile — edit info, respond to reviews, post tryouts and announce commitments. <a href="${SITE_URL}/dashboard">Go to your dashboard →</a></p>`
             : `<p>We'll follow up shortly with a secure link to complete activation.</p>`
         }
         <p style="color:#64748b">— The SoccerDadHQ team</p>`
      ),
      text: `Hi ${r.claimant_name ?? "there"},\n\nYour claim for ${who} has been ${active ? "activated" : "approved"}.\n${active ? `Manage it at ${SITE_URL}/dashboard` : "We'll send a link to complete activation."}\n\n— SoccerDadHQ`,
    });
  } else if (table === "submissions") {
    const to = r.submitter_email as string | undefined;
    if (!to) return;
    const typeLabel = TYPE_LABEL[r.kind] ?? r.kind;
    await sendEmail({
      to,
      subject: `Your ${typeLabel} listing was approved`,
      html: shell(
        "Submission approved",
        `<p>Thanks for submitting <strong>${r.name}</strong> to SoccerDadHQ.</p>
         <p>It's been approved and will be added to the directory. Want to manage it? You can claim the profile anytime to edit info and respond to reviews.</p>
         <p style="color:#64748b">— The SoccerDadHQ team</p>`
      ),
      text: `Thanks for submitting ${r.name} to SoccerDadHQ. It's been approved and will be added to the directory.\n\n— SoccerDadHQ`,
    });
  }
}
