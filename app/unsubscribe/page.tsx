import { Suspense } from "react";
import type { Metadata } from "next";
import UnsubscribeClient from "@/components/UnsubscribeClient";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="container-page py-20 text-center text-slate-500">Loading…</div>}>
      <UnsubscribeClient />
    </Suspense>
  );
}
