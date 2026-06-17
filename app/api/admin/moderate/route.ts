import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient, MODERATION_TABLES } from "@/lib/admin";
import { DEFAULT_ADS, adPlacementFromOrder, type Ad, type AdsConfig } from "@/lib/ads";
import { notifyApproved } from "@/lib/notifyEmail";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v ?? "").split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
}
function nz(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

/** Turn an approved crowdsourced submission into a live directory listing. Returns
 *  the admin manager URL where the admin can finish/edit it, or undefined for kinds
 *  that have no DB table yet (training-center/facility/tournament/camp stay submission-only). */
async function publishSubmission(
  service: ReturnType<typeof adminServiceClient>,
  sub: Record<string, any>
): Promise<string | undefined> {
  if (!service) return undefined;
  const kind = sub.kind as string;
  const LISTING_KINDS = ["training-center", "facility", "tournament", "camp"];
  if (!["club", "school", "coach", ...LISTING_KINDS].includes(kind)) return undefined;

  const name = String(sub.name ?? "").trim();
  const region = String(sub.region ?? "").trim();
  const city = String(sub.city ?? "").trim();
  const website = sub.website || null;
  if (!name) throw new Error("Submission has no name.");
  if (!region) throw new Error("Submission is missing a region — can't publish. Reject it or ask the submitter.");
  const slug = slugify(name);
  // Filter-relevant fields the submitter provided (optional; admin completes the rest).
  const det = sub.details && typeof sub.details === "object" ? (sub.details as Record<string, any>) : {};

  const friendly = (e: { code?: string; message: string }) =>
    e.code === "23505"
      ? new Error(`A ${kind} with this name/slug is already in the directory.`)
      : new Error(e.message);

  if (kind === "club") {
    if (!city) throw new Error("Club submission is missing a city.");
    const { error } = await service.from("clubs").upsert(
      {
        id: `c-${slug}`, slug, name, region, city, website,
        zip: nz(det.zip),
        phone: nz(det.phone),
        email: nz(det.email),
        leagues: toArr(det.leagues),
        age_groups: toArr(det.age_groups),
        genders: toArr(det.genders),
      },
      { onConflict: "id" }
    );
    if (error) throw friendly(error);
    return "/admin/clubs";
  }
  if (kind === "school") {
    if (!city) throw new Error("School submission is missing a city.");
    const programs = toArr(det.programs);
    const { error } = await service.from("schools").upsert(
      {
        id: `s-${slug}`, slug, name, region, city, website,
        zip: nz(det.zip),
        type: det.type === "Private" ? "Private" : "Public",
        fhsaa_class: nz(det.fhsaa_class),
        district: nz(det.district),
        programs: programs.length ? programs : ["Boys", "Girls"],
      },
      { onConflict: "id" }
    );
    if (error) throw friendly(error);
    return "/admin/schools";
  }
  if (LISTING_KINDS.includes(kind)) {
    if (!city) throw new Error("Submission is missing a city.");
    // Filter facets the submitter picked (facet_focus/format/surface/type/level)
    // become the listing's tags, so the directory's facet filters work.
    const facetVals = Object.entries(det)
      .filter(([k]) => k.startsWith("facet_"))
      .map(([, v]) => String(v ?? "").trim())
      .filter(Boolean);
    const tags = Array.from(new Set([...facetVals, ...toArr(det.tags)]));
    const { error } = await service.from("listings").upsert(
      {
        id: `${kind}-${slug}`, slug, kind, name, region, city, website,
        description: sub.notes || null,
        zip: nz(det.zip),
        phone: nz(det.phone),
        email: nz(det.email),
        tags,
      },
      { onConflict: "id" }
    );
    if (error) {
      if (error.message?.includes("does not exist") || (error as any).code === "42P01")
        throw new Error("The listings table doesn't exist yet — run the listings migration in Supabase first.");
      throw friendly(error);
    }
    return "/admin/listings";
  }

  // coach (coaches table has no website column → fold extra detail into bio)
  const { error } = await service.from("coaches").upsert(
    {
      id: `coach-${slug}`, slug, name, region, city: city || null,
      bio: sub.notes || null,
      phone: nz(det.phone),
      age_groups: toArr(det.age_groups),
      genders: toArr(det.genders),
      private_training: det.private_training === true,
    },
    { onConflict: "id" }
  );
  if (error) throw friendly(error);
  return "/admin/coaches";
}

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
    placement: adPlacementFromOrder(o.placement),
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

  // Approving a crowdsourced submission first creates the live directory listing —
  // if that fails (missing region/city, duplicate), we DON'T flip the status, so the
  // admin sees the problem and the submission stays in the queue.
  let editHref: string | undefined;
  if (body.table === "submissions" && body.status === "approved") {
    const { data: sub } = await service.from("submissions").select("*").eq("id", body.id).single();
    if (!sub) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    try {
      editHref = await publishSubmission(service, sub as Record<string, any>);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Could not create the listing." }, { status: 400 });
    }
  }

  const { error } = await service.from(body.table!).update({ status: body.status }).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Approving an ad order to "live" also creates the live inventory creative.
  if (body.table === "ad_orders" && body.status === "live") {
    await publishAdOrder(service, body.id);
  }

  // Notify the claimant/submitter when their claim or submission is approved.
  const notifyClaim = body.table === "claim_requests" && (body.status === "approved" || body.status === "active");
  const notifySubmission = body.table === "submissions" && body.status === "approved";
  if (notifyClaim || notifySubmission) {
    const { data: r } = await service.from(body.table!).select("*").eq("id", body.id).single();
    if (r) {
      await notifyApproved(body.table!, r as Record<string, any>);
      // Approving a claim grants ownership for 1 year — recorded in profile_claims
      // (decoupled from the entity so it works for seed + DB profiles).
      if (notifyClaim) {
        const c = r as Record<string, any>;
        const until = new Date();
        until.setUTCFullYear(until.getUTCFullYear() + 1);
        await service.from("profile_claims").upsert(
          {
            subject_type: c.subject_type,
            subject_slug: c.subject_slug,
            subject_name: c.subject_name ?? null,
            owner_id: c.user_id ?? null,
            plan: c.plan ?? "claim",
            claimed_until: until.toISOString().slice(0, 10),
          },
          { onConflict: "subject_type,subject_slug" }
        );
      }
    }
  }

  return NextResponse.json({ ok: true, status: body.status, editHref });
}
