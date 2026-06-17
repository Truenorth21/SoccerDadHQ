"use client";

import { useState } from "react";
import type { AdPlacement, AdSize } from "@/lib/adPlacements";

const SIZES: AdSize[] = ["leaderboard", "rectangle", "sidebar"];

/** Admin table for the Google AdSense placements (table `ad_placements`).
 *  Each row edits size / slot id / enabled and saves on its own. */
export default function AdPlacementsEditor({ initial }: { initial: AdPlacement[] }) {
  const [rows, setRows] = useState<AdPlacement[]>(initial);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ slot: string; text: string; ok: boolean } | null>(null);

  function patch(slot: string, next: Partial<AdPlacement>) {
    setRows((rs) => rs.map((r) => (r.slot === slot ? { ...r, ...next } : r)));
    setMsg(null);
  }

  async function save(row: AdPlacement) {
    setSavingSlot(row.slot);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/ad-placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed");
      setMsg({ slot: row.slot, text: d.message || "Saved.", ok: true });
    } catch (e: any) {
      setMsg({ slot: row.slot, text: e.message, ok: false });
    } finally {
      setSavingSlot(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
      <table className="w-full bg-white text-sm">
        <thead className="bg-slate-50 text-left font-heading text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Slot</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Size</th>
            <th className="px-4 py-2">AdSense slot ID</th>
            <th className="px-4 py-2 text-center">Enabled</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slot} className="border-t border-slate-100 align-middle">
              <td className="px-4 py-3 font-medium text-navy">{row.slot}</td>
              <td className="px-4 py-3 text-slate-500">{row.location}</td>
              <td className="px-4 py-3">
                <select
                  className="input"
                  value={row.size}
                  onChange={(e) => patch(row.slot, { size: e.target.value as AdSize })}
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  className="input"
                  value={row.adsense_slot_id}
                  placeholder="e.g. 1234567890"
                  onChange={(e) => patch(row.slot, { adsense_slot_id: e.target.value })}
                />
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 align-middle"
                  checked={row.enabled}
                  onChange={(e) => patch(row.slot, { enabled: e.target.checked })}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  className="btn-primary text-sm"
                  onClick={() => save(row)}
                  disabled={savingSlot === row.slot}
                >
                  {savingSlot === row.slot ? "Saving…" : "Save"}
                </button>
                {msg?.slot === row.slot && (
                  <span className={`ml-2 text-xs ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
