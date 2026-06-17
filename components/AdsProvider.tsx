"use client";

import { createContext, useContext } from "react";
import { DEFAULT_ADS, type AdsConfig } from "@/lib/ads";
import type { AdPlacementClient } from "@/lib/adPlacements";

type AdsContextValue = {
  ads: AdsConfig;
  /** AdSense config keyed by ad-slot category (see lib/adPlacements). */
  placements: Record<string, AdPlacementClient>;
};

const AdsContext = createContext<AdsContextValue>({ ads: DEFAULT_ADS, placements: {} });

/** The sold / house ad inventory. */
export function useAdsConfig() {
  return useContext(AdsContext).ads;
}

/** AdSense placements keyed by ad-slot category. */
export function useAdPlacements() {
  return useContext(AdsContext).placements;
}

export default function AdsProvider({
  config,
  placements = {},
  children,
}: {
  config: AdsConfig;
  placements?: Record<string, AdPlacementClient>;
  children: React.ReactNode;
}) {
  return <AdsContext.Provider value={{ ads: config, placements }}>{children}</AdsContext.Provider>;
}
