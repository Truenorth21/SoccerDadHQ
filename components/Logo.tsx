import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      {/* Badge mark (same image as the favicon). White circle keeps it crisp on
          both the white header and the dark footer. */}
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="SoccerDadHQ" className="h-full w-full object-cover" />
      </span>
      <span className="flex flex-col leading-none">
        {/* Wordmark — SOCCER (navy) DAD (blue) HQ (navy). Sets the width. */}
        <span className={`font-heading text-xl font-bold uppercase tracking-tight ${light ? "text-white" : "text-navy"}`}>
          Soccer<span className="text-brand-sky">Dad</span>HQ
        </span>
        {/* Tagline justified to span the exact width of the wordmark above it. */}
        <span
          className={`mt-0.5 block w-full text-justify font-heading text-[10px] font-semibold uppercase [text-align-last:justify] ${
            light ? "text-slate-300" : "text-slate-400"
          }`}
        >
          Florida Youth Soccer
        </span>
      </span>
    </Link>
  );
}
