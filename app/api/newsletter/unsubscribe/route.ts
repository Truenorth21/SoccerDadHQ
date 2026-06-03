import { NextResponse } from "next/server";
import { verifyUnsub } from "@/lib/unsubscribe";
import { adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !verifyUnsub(email, body.token ?? "")) {
    return NextResponse.json({ error: "Invalid or expired unsubscribe link." }, { status: 400 });
  }

  const service = adminServiceClient();
  if (!service) {
    // Demo mode — accept gracefully.
    return NextResponse.json({ message: "You've been unsubscribed (demo mode)." });
  }

  const { error } = await service
    .from("newsletter_subscribers")
    .update({ unsubscribed: true })
    .eq("email", email);
  if (error) return NextResponse.json({ error: "Could not unsubscribe. Please try again." }, { status: 500 });

  return NextResponse.json({ message: "You've been unsubscribed. Sorry to see you go!" });
}
