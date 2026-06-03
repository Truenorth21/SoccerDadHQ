import { publicClient } from "./supabase/public";
import { DEFAULT_ADS, type AdsConfig } from "./ads";

/** Reads admin-edited ad inventory + house ads from site_config (key='ads'),
 *  falling back to the code defaults. Server-only. */
export async function getAdsConfig(): Promise<AdsConfig> {
  const supabase = publicClient();
  if (!supabase) return DEFAULT_ADS;
  try {
    const { data } = await supabase.from("site_config").select("value").eq("key", "ads").single();
    const v = data?.value as Partial<AdsConfig> | undefined;
    if (!v) return DEFAULT_ADS;
    return {
      inventory: v.inventory?.length ? v.inventory : DEFAULT_ADS.inventory,
      house: { ...DEFAULT_ADS.house, ...(v.house ?? {}) },
    };
  } catch {
    return DEFAULT_ADS;
  }
}
