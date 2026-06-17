import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminServiceClient } from "@/lib/admin";
import { isProfileOwner } from "@/lib/claims";
import { getClubBySlug, getCoachBySlug, getSchoolBySlug } from "@/lib/data";
import { getListingBySlug, type ListingKind } from "@/lib/listings";

export const dynamic = "force-dynamic";

async function entityId(type: string, slug: string): Promise<string | undefined> {
  if (type === "club") return (await getClubBySlug(slug))?.id;
  if (type === "coach") return (await getCoachBySlug(slug))?.id;
  if (type === "school") return (await getSchoolBySlug(slug))?.id;
  return (await getListingBySlug(type as ListingKind, slug))?.id;
}

/** Owner-gated reply to a review. Verifies the review belongs to the owner's
 *  profile before saving the public response. Send an empty reply to clear it. */
export async function POST(request: Request) {
  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const subjectType = String(b.subject_type || "");
  const slug = String(b.slug || "");
  const reviewId = String(b.review_id || "");
  const reply = typeof b.reply === "string" ? b.reply.trim() : "";
  if (!subjectType || !slug || !reviewId) return NextResponse.json({ error: "Missing fields." }, { status: 400 });

  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;
  if (!(await isProfileOwner(subjectType, slug, userId))) {
    return NextResponse.json({ error: "Only the profile owner can reply." }, { status: 403 });
  }

  const svc = adminServiceClient();
  if (!svc) return NextResponse.json({ error: "Service key not set." }, { status: 503 });

  // The review must belong to THIS owner's profile.
  const id = await entityId(subjectType, slug);
  const { data: review } = await svc.from("reviews").select("subject_type, subject_id").eq("id", reviewId).maybeSingle();
  if (!review || review.subject_type !== subjectType || review.subject_id !== id) {
    return NextResponse.json({ error: "That review isn't on your profile." }, { status: 403 });
  }

  const { error } = await svc
    .from("reviews")
    .update({ owner_reply: reply || null, owner_reply_at: reply ? new Date().toISOString() : null })
    .eq("id", reviewId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
