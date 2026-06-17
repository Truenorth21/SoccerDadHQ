"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { regionName } from "@/lib/regions";

interface RankInfo {
  rank: number;
  regionRank: number;
  regionTotal: number;
  region: string;
  votes: number;
  programLabel?: string;
}

/** "Recommend this for the month's community rankings" — votes via /api/votes
 *  (1 per person/item/month). On success it shows the voter the impact they just
 *  made (new rank) and a one-tap share to rally more votes — closing the loop
 *  instead of dead-ending at "thanks". Used on club & coach profiles. */
export default function RankingVote({
  itemId,
  itemName,
  period,
  category,
  profileUrl,
}: {
  itemId: string;
  itemName: string;
  period: string;
  category?: string;
  profileUrl?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "voted" | "dup" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [rank, setRank] = useState<RankInfo | null>(null);
  const [copied, setCopied] = useState(false);

  async function vote() {
    if (state === "voted") return;
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, item_name: itemName, category }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setRank(d.rank ?? null);
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

  const shareText =
    rank && rank.votes > 0
      ? `I just recommended ${itemName} in the ${period} SoccerDadHQ rankings — they're #${rank.regionRank} in ${regionName(
          rank.region
        )}. Add your vote: ${profileUrl ?? ""}`
      : `I just recommended ${itemName} for the ${period} SoccerDadHQ community rankings. Add your vote: ${profileUrl ?? ""}`;

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${itemName} · SoccerDadHQ Rankings`, text: shareText, url: profileUrl });
        return;
      } catch {
        /* cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const done = state === "voted" || state === "dup";

  return (
    <div className="card border-2 border-dashed border-brand-sky/40 p-5 text-center">
      <h3 className="font-heading text-lg font-bold text-navy">📊 Community Rankings</h3>

      {state === "voted" && rank && rank.votes > 0 ? (
        <p className="mt-1 text-sm text-slate-600">
          🎉 You helped <span className="font-semibold text-navy">{itemName}</span> reach{" "}
          <span className="font-semibold text-navy">#{rank.regionRank}</span> in {regionName(rank.region)}
          {rank.programLabel ? ` (${rank.programLabel})` : ""} — {rank.votes} recommendation{rank.votes === 1 ? "" : "s"} this {period}.
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-500">
          {state === "voted"
            ? `Thanks! You recommended ${itemName} for ${period}.`
            : state === "dup"
              ? msg
              : `Think ${itemName} deserves a spot? Recommend them in ${period}'s rankings — one vote per person, per month.`}
        </p>
      )}

      {!done && (
        <button onClick={vote} className="btn-primary mt-3 w-full">
          👍 Recommend for {period.split(" ")[0]}
        </button>
      )}

      {done && profileUrl && (
        <button onClick={share} className="btn-primary mt-3 w-full">
          {copied ? "Copied — paste it anywhere ✓" : "📣 Share to rally more votes"}
        </button>
      )}

      <p className="mt-2 text-xs text-slate-400">
        <Link href="/rankings" className="font-semibold text-brand-blue hover:underline">
          See the full rankings →
        </Link>
      </p>
      {state === "error" && <p className="mt-1 text-xs text-red-600">{msg}</p>}
    </div>
  );
}
