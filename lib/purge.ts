import { revalidatePath } from "next/cache";

type Handler = (req: any, ctx: any) => Promise<Response> | Response;

/** Wraps a route handler that changes public content (listings, reviews, ads,
 *  site config). After a successful response it marks every cached page stale,
 *  so edits show on the next visit even though pages are cached for 24h. */
export function purgeOnSuccess(handler: Handler): Handler {
  return async (req, ctx) => {
    const res = await handler(req, ctx);
    if (res.ok) {
      try {
        revalidatePath("/", "layout");
      } catch {
        /* never fail the request over cache purging */
      }
    }
    return res;
  };
}
