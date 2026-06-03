import { initials } from "@/lib/utils";

/** Generated club crest / coach avatar — a colored tile with initials.
 *  Avoids needing real image assets while looking intentional. */
export default function Crest({
  name,
  color,
  size = "md",
  rounded = "lg",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: "lg" | "full";
}) {
  const dims = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-4xl",
  }[size];
  return (
    <span
      className={`crest grid shrink-0 place-items-center font-heading font-bold uppercase text-white shadow-sm ${dims} ${
        rounded === "full" ? "rounded-full" : "rounded-xl"
      }`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/** A decorative gradient panel used for galleries / hero imagery. */
export function GradientPanel({
  seed,
  color,
  className = "",
  label,
}: {
  seed: string;
  color: string;
  className?: string;
  label?: string;
}) {
  // derive a second hue offset deterministically from the seed
  const offset = (seed.charCodeAt(0) + seed.length * 7) % 60;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(${120 + offset}deg, ${color}, #0a1628)`,
      }}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,#fff_0,transparent_45%)]" />
      {label && (
        <span className="absolute bottom-2 left-3 font-heading text-xs font-semibold uppercase tracking-wider text-white/80">
          {label}
        </span>
      )}
    </div>
  );
}
