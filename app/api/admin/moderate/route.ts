import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient, MODERATION_TABLES } from "@/lib/admin";
import { DEFAULT_ADS, type Ad, type AdsConfig } from "@/lib/ads";

export const dynamic = "force-dynamic";

/** Turn an approved ad order into a live inventory creative (one click). */
async function publishAdOrder(service: ReturnType<typeof adminServiceClient>, orderId: string) {
  if (!service) return;
  const { data: order } = await service.from("ad_orders").select("*").eq("id", orderId).single();
  if (!order) return;
  const o = order as Record<string, any>;

  const start = o.start_date ? new Date(o.start_date) : null;
  const ends =
    start && o.weeks ? new Date(start.getTime() + Number(o.weeks) * 7 * 86400000).toISOString() : undefined;

  const creative: Ad = {
    id: `order-${orderId.slice(0, 8)}`,
    advertiser: o.business,
    headline: o.business,
    body: o.notes || `Sponsored by ${o.business}`,
    cta: "Learn more",
    href: o.landing_url || "#",
    color: "#1a4fa0",
    image: o.creative_url || undefined,
    starts: start ? start.toISOString() : undefined,
    ends,
  };

  const { data: row } = await service.from("site_config").select("value").eq("key", "ads").single();
  const cfg: AdsConfig = (row?.value as AdsConfig) ?? DEFAULT_ADS;
  const inventory = [...(cfg.inventory ?? []).filter((a) => a.id !== creative.id), creative];
  await service
    .from("site_config")
    .upsert({ key: "ads", value: { ...cfg, inventory }, updated_at: new Date().toISOString() }, { onConflict: "key" });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const service = adminServiceClient();
  if (!service) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 503 });
  }

  let body: { table?: string; id?: string; status?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cfg = body.table ? MODERATION_TABLES[body.table] : undefined;
  if (!cfg || !body.id) {
    return NextResponse.json({ error: "Unknown table or missing id." }, { status: 400 });
  }

  // Delete (e.g. removing an abusive review)
  if (body.action === "delete") {
    if (!cfg.canDelete) {
      return NextResponse.json({ error: "Delete not allowed for this table." }, { status: 400 });
    }
    const { error } = await service.from(body.table!).delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, removed: true });
  }

  // Status transition
  if (!body.status || !cfg.statuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status for this table." }, { status: 400 });
  }
  const { error } = await service.from(body.table!).update({ status: body.status }).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Approving an ad order to "live" also creates the live inventory creative.
  if (body.table === "ad_orders" && body.status === "live") {
    await publishAdOrder(service, body.id);
  }

  return NextResponse.json({ ok: true, status: body.status });
}
