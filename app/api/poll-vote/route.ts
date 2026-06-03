import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Aggregated poll results: { [pollId]: { [optionIndex]: votes } }.
 *  Reads the public poll_results view (no raw rows / no PII). */
export async function GET() {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ results: {} });
  const { data, error } = await supabase.from("poll_results").select("poll_id, option_index, votes");
  if (error || !data) return NextResponse.json({ results: {} });
  const results: Record<string, Record<number, number>> = {};
  for (const r of data as { poll_id: string; option_index: number; votes: number }[]) {
    (results[r.poll_id] ||= {})[r.option_index] = r.votes;
  }
  return NextResponse.json({ results });
}

/** Record one anonymous vote. No-ops gracefully in demo mode. */
export async function POST(request: Request) {
  let body: { pollId?: string; optionIndex?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { pollId, optionIndex } = body;
  if (!pollId || typeof optionIndex !== "number" || optionIndex < 0) {
    return NextResponse.json({ error: "Invalid vote." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) return NextResponse.json({ ok: true, demo: true });

  const { error } = await supabase.from("poll_votes").insert({ poll_id: pollId, option_index: optionIndex });
  if (error) return NextResponse.json({ error: "Could not record vote." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
