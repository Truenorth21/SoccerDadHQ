import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";
import { isEmailConfigured } from "@/lib/email";
import { stateByCode } from "@/lib/states";
import { createSend, latestSend, loadSubscribers, runSend } from "@/lib/newsletterSend";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Days that must pass before the same state can be approved again. */
const MIN_DAYS_BETWEEN = 5;

/**
 * Approve & send one state's newsletter. Requires an admin AND the typed
 * confirmation "SEND XX" (XX = the state code), so it can't fire by accident.
 * If that state's last approval is still part-way through, this resumes it
 * instead of starting a new one (already-emailed people are skipped).
 */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "Add SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
  if (!isEmailConfigured) return NextResponse.json({ error: "Email isn't configured (set RESEND_API_KEY)." }, { status: 503 });

  let b: { state?: string; confirm?: string };
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const st = stateByCode(b.state);
  if (!st) return NextResponse.json({ error: "Pick a state." }, { status: 400 });
  if ((b.confirm ?? "").trim().toUpperCase() !== `SEND ${st.code}`) {
    return NextResponse.json({ error: `Type SEND ${st.code} to confirm.` }, { status: 400 });
  }

  try {
    let send = await latestSend(service, st.code);
    if (!send || send.status === "sent") {
      if (send) {
        const days = (Date.now() - +new Date(send.approved_at)) / 86_400_000;
        if (days < MIN_DAYS_BETWEEN) {
          return NextResponse.json(
            { error: `${st.name} was already sent ${days < 1 ? "today" : `${Math.floor(days)} day(s) ago`}. Wait ${MIN_DAYS_BETWEEN} days between sends.` },
            { status: 409 }
          );
        }
      }
      const subs = await loadSubscribers(service, st.code);
      if (!subs.length) return NextResponse.json({ error: `${st.name} has no active subscribers yet.` }, { status: 400 });
      send = await createSend(service, st.code, admin.email ?? admin.id);
    }
    const result = await runSend(service, send);
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: `Send failed: ${e?.message ?? "unknown error"}` }, { status: 500 });
  }
}
