import Stripe from "stripe";

const KEY = process.env.STRIPE_SECRET_KEY;

/** True only when a Stripe secret key is present, so the claim flow degrades to
 *  the manual "we'll email a payment link" path when Stripe isn't configured. */
export const isStripeConfigured = Boolean(KEY);

/** Lazily-built Stripe client (null when unconfigured). */
export function getStripe(): Stripe | null {
  if (!KEY) return null;
  return new Stripe(KEY, { apiVersion: "2025-02-24.acacia" });
}

/** Public site origin for building Checkout success/cancel URLs. */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://soccerdadhq.com";
