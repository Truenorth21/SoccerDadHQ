"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to your error tracker here (e.g. Sentry).
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="font-heading text-6xl font-bold text-brand-sky">⚠</span>
      <h1 className="mt-2 font-heading text-3xl font-bold uppercase text-navy">Something went wrong</h1>
      <p className="mt-2 max-w-md text-slate-500">
        Sorry — that page hit a snag. You can try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-outline">Back home</Link>
      </div>
    </div>
  );
}
