"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/** "Recommend this for the month's community rankings" — votes via /api/votes
 *  (1 per person/item/month). Used on club & coach profiles so people can vote
 *  from where they're browsing, not just on /rankings. */
export default function RankingVote({
  itemId,
  itemName,
  period,
}: {
  itemId: string;
  itemName: string;
  period: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "voted" | "dup" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function vote() {
    if (state === "voted") return;
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, item_name: itemName }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("voted");
        return;
      }
      if (d.code === "auth_required") {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (d.code === "duplicate") {
        setState("dup");
        setMsg(d.error);
        return;
      }
      setState("error");
      setMsg(d.error || "Could not record your vote.");
    } catch {
      setState("error");
      setMsg("Could not record your vote.");
    }
  }

  const done = state === "voted" || state === "dup";

  return (
    <div className="card border-2 border-dashed border-brand-sky/40 p-5 text-center">
      <h3 className="font-heading text-lg font-bold text-navy">📊 Community Rankings</h3>
      <p className="mt-1 text-sm text-slate-500">
        {state === "voted"
          ? `Thanks! You recommended ${itemName} for ${period}.`
          : state === "dup"
            ? msg
            : `Think ${itemName} deserves a spot? Recommend them in ${period}'s rankings — one vote per person, per month.`}
      </p>
      {!done && (
        <button onClick={vote} className="btn-primary mt-3 w-full">
          👍 Recommend for {period.split(" ")[0]}
        </button>
      )}
      <p className="mt-2 text-xs text-slate-400">
        <Link href="/rankings" className="font-semibold text-brand-blue hover:underline">See the full rankings →</Link>
      </p>
      {state === "error" && <p className="mt-1 text-xs text-red-600">{msg}</p>}
    </div>
  );
}
