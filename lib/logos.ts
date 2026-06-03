import { publicClient } from "./supabase/public";

/** Returns the uploaded logo URL for a subject, or null. Cookieless (SSG-safe). */
export async function getLogo(subjectType: "club" | "school" | "coach", slug: string): Promise<string | null> {
  const supabase = publicClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("logos")
      .select("url")
      .eq("subject_type", subjectType)
      .eq("slug", slug)
      .single();
    return (data as { url?: string } | null)?.url ?? null;
  } catch {
    return null;
  }
}
