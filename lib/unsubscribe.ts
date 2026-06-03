import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "./utils";

const SECRET = process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || "sdhq-dev-unsub-secret";

/** Per-email signed token so unsubscribe links can't be forged for arbitrary addresses. */
export function unsubToken(email: string): string {
  return createHmac("sha256", SECRET).update(email.trim().toLowerCase()).digest("hex").slice(0, 32);
}

export function verifyUnsub(email: string, token: string): boolean {
  const expected = unsubToken(email);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function unsubUrl(email: string): string {
  return `${SITE_URL}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
}

/** Placeholder used in digests (built once, fanned out) — replaced per recipient at send time. */
export const UNSUB_PLACEHOLDER = "%%UNSUB%%";
