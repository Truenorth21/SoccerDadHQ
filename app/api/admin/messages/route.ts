import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

function shell(subject: string, body: string) {
  const safe = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0a1628;padding:16px 20px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:10px;vertical-align:middle"><img src="${SITE_URL}/icon.png" width="38" height="38" alt="SoccerDadHQ" style="display:block;width:38px;height:38px;border-radius:50%;background:#fff;border:0" /></td>
        <td style="vertical-align:middle"><span style="color:#fff;font-weight:800;font-size:18px">SOCCER<span style="color:#2a7de1">DAD</span>HQ</span></td>
      </tr></table>
    </div>
    <div style="padding:24px 20px;color:#0a1628">
      <h2 style="margin:0 0 12px;font-size:20px">${subject}</h2>
      <p style="font-size:15px;line-height:1.6;color:#334155">${safe}</p>
      <p style="margin-top:24px;font-size:13px;color:#94a3b8">You're receiving this from <a href="${SITE_URL}/dashboard" style="color:#1a4fa0">SoccerDadHQ</a>.</p>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 503 });

  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const subject = String(b.subject ?? "").trim();
  const body = String(b.body ?? "").trim();
  const audience = ["all", "group", "user"].includes(b.audience) ? b.audience : null;
  if (!subject || !body || !audience) {
    return NextResponse.json({ error: "Subject, message and audience are required." }, { status: 400 });
  }

  // Resolve target + recipient emails.
  let target_group: string | null = null;
  let target_user: string | null = null;
  let recipients: string[] = [];

  if (audience === "user") {
    const email = String(b.email ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Enter the recipient's email." }, { status: 400 });
    const { data: prof } = await service.from("profiles").select("id,email").ilike("email", email).maybeSingle();
    if (!prof) return NextResponse.json({ error: `No registered user with email ${email}.` }, { status: 400 });
    target_user = prof.id;
    recipients = prof.email ? [prof.email] : [];
  } else if (audience === "group") {
    target_group = String(b.group_id ?? "") || null;
    if (!target_group) return NextResponse.json({ error: "Pick a group." }, { status: 400 });
    const { data: members } = await service.from("user_group_members").select("user_id").eq("group_id", target_group);
    const ids = (members ?? []).map((m: any) => m.user_id);
    if (ids.length) {
      const { data: profs } = await service.from("profiles").select("email").in("id", ids);
      recipients = (profs ?? []).map((p: any) => p.email).filter(Boolean);
    }
  } else {
    const { data: profs } = await service.from("profiles").select("email").not("email", "is", null);
    recipients = (profs ?? []).map((p: any) => p.email).filter(Boolean);
  }

  const doEmail = Boolean(b.email_copy);
  const { error } = await service.from("messages").insert({ subject, body, audience, target_group, target_user, emailed: doEmail });
  if (error) {
    if (error.message?.includes("does not exist") || (error as { code?: string }).code === "42P01") {
      return NextResponse.json({ error: "The messaging tables don't exist yet — run the migration." }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailedCount = 0;
  if (doEmail && recipients.length) {
    const html = shell(subject, body);
    const text = `${subject}\n\n${body}`;
    const results = await Promise.allSettled(recipients.map((to) => sendEmail({ to, subject, html, text })));
    emailedCount = results.filter((r) => r.status === "fulfilled").length;
  }

  return NextResponse.json({ ok: true, recipients: recipients.length, emailed: emailedCount });
}
