"use client";

import { createContext, useContext } from "react";
import { DEFAULT_ADS, type AdsConfig } from "@/lib/ads";

const AdsContext = createContext<AdsConfig>(DEFAULT_ADS);

export function useAdsConfig() {
  return useContext(AdsContext);
}

export default function AdsProvider({ config, children }: { config: AdsConfig; children: React.ReactNode }) {
  return <AdsContext.Provider value={config}>{children}</AdsContext.Provider>;
}
