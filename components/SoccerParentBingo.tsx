"use client";

import { useState } from "react";

const SQUARES = [
  "Forgot the snack",
  "Yelled “great hustle!”",
  "Lost a shin guard",
  "Wrong-color jersey",
  "FREE: arrived early for parking",
  "Coffee spill in the car",
  "Cheered for the wrong kid",
  "Cleats two sizes too small",
  "Rain delay → ice cream",
];

/** A little soccer-parent bingo — tap squares you've lived. Pure fun, no scoring. */
export default function SoccerParentBingo() {
  const [marked, setMarked] = useState<Record<number, boolean>>({ 4: true }); // free space
  const count = Object.values(marked).filter(Boolean).length;

  return (
    <div className="card p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold uppercase text-navy">Soccer Parent Bingo</h2>
        <span className="chip-amber">{count}/9</span>
      </div>
      <p className="mb-4 text-sm text-slate-500">Tap every one you've lived. Be honest. ⚽</p>
      <div className="grid grid-cols-3 gap-2">
        {SQUARES.map((s, i) => {
          const on = !!marked[i];
          return (
            <button
              key={i}
              onClick={() => setMarked((m) => ({ ...m, [i]: !m[i] }))}
              className={`flex aspect-square items-center justify-center rounded-lg p-2 text-center text-xs font-medium leading-tight transition-colors ${
                on ? "bg-brand-sky text-white" : "bg-slate-100 text-navy hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
      {count >= 9 && (
        <p className="mt-3 text-center font-heading text-sm font-bold uppercase text-brand-amber">
          🏆 Full card — you're a true soccer parent!
        </p>
      )}
    </div>
  );
}
