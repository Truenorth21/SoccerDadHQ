import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured, SITE_ORIGIN } from "@/lib/stripe";
import { getPricing, claimPriceFor, claimPlanFor, applyPromo } from "@/lib/pricing";
import { activateClaim } from "@/lib/claims";
import { notifyNewClaim, notifyApproved } from "@/lib/notifyEmail";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED = ["club", "school", "coach", "training-center", "facility", "tournament", "camp"];
const PROFILE_BASE: Record<string, string> = {
  club: "/clubs", school: "/schools", coach: "/coaches",
  "training-center": "/training-centers", facility: "/facilities", tournament: "/tournaments", camp: "/camps",
};

/**
 * Pay-to-activate claim flow. Recomputes the authoritative price server-side
 * (never trusts the client), records the claim_request, then either:
 *  - creates a Stripe Checkout Session and returns its URL, or
 *  - if the price nets to $0 (full promo) activates immediately, or
 *  - if Stripe isn't configured, falls back to the manual email-a-link path.
 */
export async function POST(request: Request) {
  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { subject_type, subject_slug, subject_name, name, role, email, phone, message, plan, promo_code, referral_code } = b;
  if (!ALLOWED.includes(subject_type) || !subject_slug || !name || !EMAIL_RE.test(email || "")) {
    return NextResponse.json({ error: "Please provide your name and a valid work email." }, { status: 400 });
  }
  // Public facilities are free but must be attested as city/county/state-operated.
  if (subject_type === "facility" && b.facility_public !== true) {
    return NextResponse.json({ error: "Please confirm this is a public city, county or state-operated facility." }, { status: 400 });
  }
  const tier: "claim" | "featured" = "claim"; // two tiers only — every paid claim is "claim"

  // Authoritative price — recomputed here, ignoring any client-supplied amount.
  const cfg = await getPricing();
  const planDef = claimPlanFor(cfg, subject_type);
  const base = claimPriceFor(cfg, subject_type, tier);
  const promo = applyPromo(cfg, promo_code ?? "", base);
  const referralOk = Boolean((referral_code ?? "").trim()) && cfg.referral.enabled;
  const refereeDiscount = referralOk ? cfg.referral.refereeDiscount : 0;
  const discount = Math.min(base, promo.discount + refereeDiscount);
  const finalPrice = Math.max(0, base - discount);

  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  // Record the claim request (so admin always has a paper trail).
  let claimRequestId: string | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("claim_requests")
      .insert({
        subject_type, subject_slug, subject_name: subject_name ?? null,
        claimant_name: name, role: role ?? null, email, phone: phone ?? null, message: message ?? null,
        plan: tier, plan_price: finalPrice,
        promo_code: promo.ok ? promo_code || null : null,
        referral_code: referralOk ? referral_code || null : null,
        // 'pending_payment' = awaiting Stripe; hidden from the admin queue (which
        // shows 'pending') so abandoned checkouts don't clutter it. The webhook
        // flips it to 'active' on payment; the manual-fallback path below resets
        // it to 'pending' since that genuinely needs admin follow-up.
        user_id: userId, status: "pending_payment",
      })
      .select("id")
      .maybeSingle();
    claimRequestId = (data as { id?: string } | null)?.id ?? null;
  }

  // Comped (full discount): activate now, no payment needed.
  if (finalPrice <= 0) {
    await activateClaim({ subjectType: subject_type, subjectSlug: subject_slug, ownerId: userId, plan: tier });
    if (supabase && claimRequestId) await supabase.from("claim_requests").update({ status: "active" }).eq("id", claimRequestId);
    await notifyApproved("claim_requests", { email, claimant_name: name, subject_name, subject_slug, status: "active" });
    return NextResponse.json({ activated: true, message: "Your code covers the full cost — your profile is now active." });
  }

  // No Stripe keys → manual fallback (admin emails a payment link): this one
  // needs admin follow-up, so mark it 'pending' to surface in the admin queue.
  const stripe = getStripe();
  if (!isStripeConfigured || !stripe) {
    if (supabase && claimRequestId) await supabase.from("claim_requests").update({ status: "pending" }).eq("id", claimRequestId);
    await notifyNewClaim({ subject_type, subject_name, subject_slug, claimant_name: name, role, email, phone, message, plan: tier, plan_price: finalPrice, promo_code, referral_code });
    return NextResponse.json({ message: "Thanks! We received your claim — we'll email you a secure payment link to activate." });
  }

  // Stripe Checkout (one-time annual charge).
  const profilePath = `${PROFILE_BASE[subject_type] ?? ""}/${subject_slug}`;
  const tierLabel = "Claim"; // tier is always "claim" today (see above)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(finalPrice * 100),
            product_data: {
              name: `SoccerDadHQ ${tierLabel} — ${subject_name ?? subject_slug}`,
              description: `${planDef.label} · annual profile ${tierLabel.toLowerCase()} (1 year)`,
            },
          },
        },
      ],
      metadata: {
        kind: "claim",
        claim_request_id: claimRequestId ?? "",
        subject_type, subject_slug,
        subject_name: subject_name ?? "",
        claimant_name: name,
        claimant_email: email,
        plan: tier,
        user_id: userId ?? "",
      },
      success_url: `${SITE_ORIGIN}/claim/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_ORIGIN}${profilePath}?claim=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: `Could not start checkout: ${e?.message ?? "unknown error"}` }, { status: 500 });
  }
}
