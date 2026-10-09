import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./lib/supabase/config";

export async function middleware(request: NextRequest) {
  // No-op when Supabase isn't configured — the site still runs on seed data.
  if (!isSupabaseConfigured) return NextResponse.next();
  // Signed-out visitors (and every crawler) have no Supabase auth cookie, so
  // there is no session to refresh: skip the round-trip to Supabase.
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session so Server Components always see a valid token.
  await supabase.auth.getUser();
  return response;
}

// Only run on the pages and APIs that read the signed-in user on the server.
// Public directory pages are cached and don't need it; running middleware on
// every page view and bot hit was a big share of the Vercel Hobby usage.
// (The browser client keeps its own session fresh on the public pages.)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/login",
    "/claim/:path*",
    "/advertise/:path*",
    "/rankings/:path*",
    "/api/((?!track|ad-events|cron).*)",
  ],
};
