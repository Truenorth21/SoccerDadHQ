import { NextResponse } from "next/server";
import { adminServiceClient } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

/* Daily: email profile owners ~30 and ~7 days before their claim lapses.
 * Auth: when CRON_SECRET is set, requires `Authorization: Bearer <CRON_SECRET>`
 * (Vercel Cron sends it) or `?secret=`. */

function shell(subject: string, inner: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0a1628;padding:16px 20px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:10px;vertical-align:middle"><img src="${SITE_URL}/icon.png" width="38" height="38" alt="SoccerDadHQ" style="display:block;width:38px;height:38px;border-radius:50%;background:#fff;border:0" /></td>
        <td style="vertical-align:middle"><span style="color:#fff;font-weight:800;font-size:18px">SOCCER<span style="color:#2a7de1">DAD</span>HQ</span></td>
      </tr></table>
    </div>
    <div style="padding:24px 20px;color:#0a1628">
      <h2 style="margin:0 0 12px;font-size:20px">${subject}</h2>
      <p style="font-size:15px;line-height:1.6;color:#334155">${inner}</p>
    </div>
  </div>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}` && searchParams.get("secret") !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "Service key not set." }, { status: 503 });

  const todayStr = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 31 * 86400000).toISOString().slice(0, 10);
  const { data: claims, error } = await service
    .from("profile_claims")
    .select("id, subject_type, subject_name, subject_slug, claimed_until, reminded_30, reminded_7, profiles(email)")
    .not("claimed_until", "is", null)
    .gte("claimed_until", todayStr)
    .lte("claimed_until", horizon);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const c of (claims ?? []) as any[]) {
    const email = c.profiles?.email;
    if (!email) continue;
    const days = Math.ceil((+new Date(`${c.claimed_until}T00:00:00Z`) - Date.now()) / 86400000);
    let kind: "30" | "7" | null = null;
    if (days <= 7 && !c.reminded_7) kind = "7";
    else if (days <= 30 && days > 7 && !c.reminded_30) kind = "30";
    if (!kind) continue;

    const name = c.subject_name || c.subject_slug;
    const until = new Date(`${c.claimed_until}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    const subject = `Your SoccerDadHQ profile claim expires in ${days} day${days === 1 ? "" : "s"}`;
    const inner = `Your claim on <strong>${name}</strong> expires on <strong>${until}</strong>. Renew to keep managing your profile, responding to reviews, and receiving messages from families. <a href="${SITE_URL}/dashboard" style="color:#1a4fa0">Open your dashboard →</a>`;
    try {
      await sendEmail({ to: email, subject, html: shell(subject, inner), text: `${subject}\n\nYour claim on "${name}" expires ${until}. Renew at ${SITE_URL}/dashboard` });
      await service.from("profile_claims").update(kind === "7" ? { reminded_7: true, reminded_30: true } : { reminded_30: true }).eq("id", c.id);
      sent++;
    } catch {
      /* skip on send failure; retried next run */
    }
  }
  return NextResponse.json({ ok: true, checked: claims?.length ?? 0, sent });
}
