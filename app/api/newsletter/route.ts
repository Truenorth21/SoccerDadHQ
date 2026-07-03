import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/welcomeEmail";
import { isEmailConfigured } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string; region?: string; age_confirmed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const region = body.region ?? null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (body.age_confirmed !== true) {
    return NextResponse.json({ error: "You must confirm that you are at least 13." }, { status: 400 });
  }

  const welcome = "Welcome to The Sideline! ⚽ Check your inbox — your first issue lands this week.";

  const supabase = createClient();

  // Persist the subscriber if Supabase is configured. Plain insert (only needs
  // the "anyone subscribe" INSERT policy); a duplicate email (23505) is fine —
  // they're already on the list.
  if (supabase) {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, region });
    if (error && error.code !== "23505") {
      return NextResponse.json({ error: `Could not subscribe: ${error.message}` }, { status: 500 });
    }
  }

  // Send the welcome email whenever Resend is configured (independent of Supabase).
  if (isEmailConfigured) {
    await sendWelcomeEmail(email, region);
    return NextResponse.json({ message: welcome });
  }

  // Neither/partial config — accept gracefully so the UI still works.
  return NextResponse.json({
    message: supabase
      ? "Welcome to The Sideline! ⚽ You're subscribed. (Add RESEND_API_KEY to send the welcome email.)"
      : "Welcome to The Sideline! ⚽ (Demo mode — add Supabase + Resend keys to persist and email subscribers.)",
  });
}
