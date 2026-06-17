import { NextResponse } from "next/server";
import { getCurrentAdmin, adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

const CATS = ["ads", "claims", "partners", "other"];

/** Add a manual revenue entry (partner deal, offline sponsorship, anything). */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 503 });

  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const amount = Number(b.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a positive amount." }, { status: 400 });
  }
  const category = CATS.includes(b.category) ? b.category : "other";

  const { error } = await service.from("revenue_entries").insert({
    category,
    amount,
    source: b.source?.trim() || null,
    note: b.note?.trim() || null,
    occurred_at: b.occurred_at || new Date().toISOString().slice(0, 10),
  });
  if (error) {
    if (error.message?.includes("does not exist") || (error as { code?: string }).code === "42P01") {
      return NextResponse.json({ error: "The revenue_entries table doesn't exist yet — run the migration." }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Remove a revenue entry. */
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const service = adminServiceClient();
  if (!service) return NextResponse.json({ error: "Service key not set." }, { status: 503 });

  let id: string | undefined;
  try {
    id = (await request.json()).id;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await service.from("revenue_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
