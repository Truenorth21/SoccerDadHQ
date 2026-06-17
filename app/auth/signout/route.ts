import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Server-side sign-out: revokes the Supabase session and explicitly expires the
 *  auth cookies on the redirect response (a client-only signOut often can't clear
 *  the server-set cookie). Reached via a form POST from the Sign-out button. */
async function signOutAndRedirect(request: NextRequest) {
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      /* revoke may fail; we still expire the cookies below */
    }
  }

  const res = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  // Belt-and-suspenders: expire every Supabase auth cookie on this response.
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith("sb-")) {
      res.cookies.set(c.name, "", { maxAge: 0, path: "/" });
    }
  }
  return res;
}

export async function POST(request: NextRequest) {
  return signOutAndRedirect(request);
}
export async function GET(request: NextRequest) {
  return signOutAndRedirect(request);
}
