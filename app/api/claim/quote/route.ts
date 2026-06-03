import { NextResponse } from "next/server";
import { getPricing, claimPlanFor, claimPriceFor, applyPromo } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** Computes the annual price for an entity type + tier (claim | featured),
 *  applying a promo code and/or a referral code. Drives the claim form's
 *  live price preview. */
export async function POST(request: Request) {
  let body: { type?: string; tier?: "claim" | "featured"; promo?: string; referral?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cfg = await getPricing();
  const tier = body.tier === "featured" ? "featured" : "claim";
  const plan = claimPlanFor(cfg, body.type ?? "");
  const base = claimPriceFor(cfg, body.type ?? "", tier);

  const promo = applyPromo(cfg, body.promo ?? "", base);
  const referralOk = Boolean(body.referral?.trim()) && cfg.referral.enabled;
  const referralDiscount = referralOk ? cfg.referral.refereeDiscount : 0;

  const discount = Math.min(base, promo.discount + referralDiscount);
  const final = Math.max(0, base - discount);

  return NextResponse.json({
    label: plan.label,
    tier,
    claimPrice: plan.claim,
    featuredPrice: plan.featured,
    base,
    discount,
    final,
    promoOk: promo.ok,
    promoNote: promo.note ?? null,
    referralOk,
    referralReward: cfg.referral.referrerReward,
  });
}
