"use client";

import { useId, useState } from "react";

function Star({ fill, className = "" }: { fill: number; className?: string }) {
  // fill: 0..1 — useId keeps the gradient id stable across SSR/CSR (no hydration mismatch)
  const id = `star-${useId()}`;
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#e8a020" />
          <stop offset={`${fill * 100}%`} stopColor="#d8dde6" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M10 1.5l2.6 5.3 5.9.86-4.25 4.14 1 5.86L10 15.9l-5.25 2.76 1-5.86L1.5 7.66l5.9-.86L10 1.5z"
      />
    </svg>
  );
}

export function Stars({
  value,
  size = "md",
  className = "",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} fill={Math.max(0, Math.min(1, value - i))} className={dim} />
      ))}
    </span>
  );
}

export function RatingBadge({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 ring-1 ring-amber-100">
        <span className="font-heading text-sm font-bold text-amber-700">{value.toFixed(1)}</span>
        <Stars value={value} size="sm" />
      </span>
      {count !== undefined && (
        <span className="text-xs text-slate-500">
          {count} review{count === 1 ? "" : "s"}
        </span>
      )}
    </span>
  );
}

/** Interactive star input for review forms. */
export function StarInput({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (v: number) => void;
  name?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="inline-flex items-center gap-1" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="p-0.5"
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          aria-checked={value === i}
          role="radio"
        >
          <Star fill={shown >= i ? 1 : 0} className="h-6 w-6 transition-transform hover:scale-110" />
        </button>
      ))}
    </span>
  );
}
