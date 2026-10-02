import type { SupabaseClient } from "@supabase/supabase-js";
import { buildRegionDigest, sendBuiltDigest } from "./digestEmail";
import { REGION_MAP } from "./regions";
import { stateByCode } from "./states";

/* State newsletters only go out after an admin approves them at /admin/newsletter.
 * Each approval is one row in newsletter_sends (one state). Every recipient is
 * claimed in newsletter_deliveries BEFORE the email goes out, so a double click,
 * a resumed run or the daily cron can never email the same person twice for the
 * same approval. Nothing in this file is ever called on a schedule unless an
 * approval row already exists. */

export interface Subscriber {
  email: string;
  state: string;
  /** A region key that belongs to the subscriber's state, or null for the state-wide edition. */
  region: string | null;
}

export interface SendRow {
  id: string;
  state: string;
  status: "sending" | "sent";
  approved_by: string | null;
  approved_at: string;
  finished_at: string | null;
  recipients: number;
  delivered: number;
  failed: number;
}

/** Every active subscriber, paged (Supabase caps a select at 1000 rows). */
export async function loadSubscribers(service: SupabaseClient, state?: string): Promise<Subscriber[]> {
  const out: Subscriber[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    let q = service
      .from("newsletter_subscribers")
      .select("email, state, region")
      .eq("unsubscribed", false)
      .order("email")
      .range(from, from + PAGE - 1);
    if (state) q = q.eq("state", state);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    for (const r of (data ?? []) as { email: string; state: string | null; region: string | null }[]) {
      const st = stateByCode(r.state)?.code;
      if (!st) continue; // no state → we don't know which edition fits, so skip rather than guess
      const region = r.region && REGION_MAP[r.region]?.state === st ? r.region : null;
      out.push({ email: r.email.trim().toLowerCase(), state: st, region });
    }
    if (!data || data.length < PAGE) break;
  }
  return out;
}

/** Subscribers per state, and per region within each state. */
export function countAudience(subs: Subscriber[]) {
  const byState: Record<string, { total: number; regions: Record<string, number> }> = {};
  for (const s of subs) {
    const e = (byState[s.state] ??= { total: 0, regions: {} });
    e.total++;
    const k = s.region ?? "";
    e.regions[k] = (e.regions[k] ?? 0) + 1;
  }
  return byState;
}

/** The most recent approval for a state, if any. */
export async function latestSend(service: SupabaseClient, state: string): Promise<SendRow | null> {
  const { data } = await service
    .from("newsletter_sends")
    .select("*")
    .eq("state", state)
    .order("approved_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as SendRow | null) ?? null;
}

export async function recentSends(service: SupabaseClient, limit = 20): Promise<SendRow[]> {
  const { data } = await service
    .from("newsletter_sends")
    .select("*")
    .order("approved_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as SendRow[];
}

/** Records an admin's approval to send a state's newsletter. */
export async function createSend(service: SupabaseClient, state: string, approvedBy: string): Promise<SendRow> {
  const { data, error } = await service
    .from("newsletter_sends")
    .insert({ state, approved_by: approvedBy, status: "sending" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as SendRow;
}

/**
 * Sends an APPROVED state newsletter to every active subscriber in that state who
 * hasn't been sent this approval yet. Each subscriber gets their region's edition
 * (or the state-wide one). Stops early at the time budget or send cap and leaves
 * the row 'sending' so it can be resumed; marks it 'sent' once nobody is left.
 */
export async function runSend(
  service: SupabaseClient,
  send: SendRow,
  opts: { timeBudgetMs?: number; maxSends?: number } = {}
) {
  const started = Date.now();
  const budget = opts.timeBudgetMs ?? 240_000;
  const maxSends = opts.maxSends ?? Math.max(1, Number(process.env.NEWSLETTER_MAX_PER_RUN) || 2000);
  const PACE_EVERY = 8; // brief pause every N sends to stay under Resend's rate limit
  const PACE_MS = 1100;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const subs = await loadSubscribers(service, send.state);

  // Who already has this approval's email (or a claim on it).
  const done = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await service
      .from("newsletter_deliveries")
      .select("email")
      .eq("send_id", send.id)
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of (data ?? []) as { email: string }[]) done.add(r.email);
    if (!data || data.length < 1000) break;
  }

  const groups = new Map<string, string[]>();
  for (const s of subs) {
    if (done.has(s.email)) continue;
    const k = s.region ?? "";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(s.email);
  }

  let attempts = 0;
  let stoppedEarly = false;
  outer: for (const [region, emails] of Array.from(groups.entries())) {
    const digest = await buildRegionDigest(region || null, send.state);
    for (const email of emails) {
      if (attempts >= maxSends || Date.now() - started > budget) {
        stoppedEarly = true;
        break outer;
      }
      // Claim first: the primary key (send_id, email) makes a second claim fail,
      // so two overlapping runs can't both email this person.
      const { error: claimErr } = await service
        .from("newsletter_deliveries")
        .insert({ send_id: send.id, email, region: region || null });
      if (claimErr) continue;
      const r = await sendBuiltDigest(email, digest);
      await service
        .from("newsletter_deliveries")
        .update({ ok: r.sent, error: r.sent ? null : (r.error ?? "send failed").slice(0, 300), sent_at: new Date().toISOString() })
        .eq("send_id", send.id)
        .eq("email", email);
      attempts++;
      if (attempts % PACE_EVERY === 0) await sleep(PACE_MS);
    }
  }

  // Recount from the ledger so the totals are right across resumed runs.
  const { count: delivered } = await service
    .from("newsletter_deliveries")
    .select("email", { count: "exact", head: true })
    .eq("send_id", send.id)
    .eq("ok", true);
  const { count: failed } = await service
    .from("newsletter_deliveries")
    .select("email", { count: "exact", head: true })
    .eq("send_id", send.id)
    .eq("ok", false);

  const finished = !stoppedEarly;
  const update = {
    recipients: done.size + subs.filter((s) => !done.has(s.email)).length,
    delivered: delivered ?? 0,
    failed: failed ?? 0,
    status: finished ? "sent" : "sending",
    finished_at: finished ? new Date().toISOString() : null,
  };
  await service.from("newsletter_sends").update(update).eq("id", send.id);
  return { ...send, ...update, attemptedThisRun: attempts, finished } as SendRow & { attemptedThisRun: number; finished: boolean };
}
