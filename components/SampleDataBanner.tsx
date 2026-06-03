"use client";

import { useEffect, useState } from "react";

const KEY = "sdhq:dismiss-preview";

export default function SampleDataBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(localStorage.getItem(KEY) === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="bg-brand-amber text-navy">
      <div className="container-page flex items-center gap-3 py-1.5 text-xs sm:text-sm">
        <span className="font-semibold">
          ⚠️ Preview — club info, ratings and reviews shown are <strong>sample data</strong> for
          demonstration until each program is claimed &amp; verified.
        </span>
        <button
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setHidden(true);
          }}
          className="ml-auto shrink-0 rounded px-2 py-0.5 font-heading font-bold uppercase tracking-wide hover:bg-navy/10"
          aria-label="Dismiss preview notice"
        >
          Got it ✕
        </button>
      </div>
    </div>
  );
}
