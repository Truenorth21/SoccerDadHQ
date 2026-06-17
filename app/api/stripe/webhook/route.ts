import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { adminServiceClient } from "@/lib/admin";
import { activateClaim } from "@/lib/claims";
import { notifyApproved } from "@/lib/notifyEmail";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Verifies the signature, and on `checkout.session.completed`
 * for a claim, activates the profile (profile_claims, 1 year) and emails the
 * owner. Activation is idempotent, so Stripe retries are safe.
 *
 * Setup: add the endpoint URL (/api/stripe/webhook) in the Stripe dashboard and
 * put its signing secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (e: any) {
    return NextResponse.json({ error: `Signature verification failed: ${e?.message ?? ""}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata ?? {};
    // Belt-and-suspenders: only activate on a genuinely paid session.
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, skipped: "unpaid" });
    }
    if (m.kind === "claim" && m.subject_type && m.subject_slug) {
      const ownerId = m.user_id || null;
      const res = await activateClaim({
        subjectType: m.subject_type,
        subjectSlug: m.subject_slug,
        ownerId,
        plan: m.plan || "claim",
      });
      // Mark the claim_request active (status is plain text — no new columns).
      const svc = adminServiceClient();
      if (svc && m.claim_request_id) {
        await svc.from("claim_requests").update({ status: "active" }).eq("id", m.claim_request_id);
      }
      await notifyApproved("claim_requests", {
        email: m.claimant_email || session.customer_email,
        claimant_name: m.claimant_name,
        subject_name: m.subject_name,
        subject_slug: m.subject_slug,
        status: "active",
      });
      if (!res.ok) {
        // Activation failed (e.g. service key missing) — surface so Stripe retries.
        return NextResponse.json({ received: true, warning: "activation-failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
