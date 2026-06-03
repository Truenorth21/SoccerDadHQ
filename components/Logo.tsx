import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-brand-amber shadow-sm">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-navy" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2.2l2.6 1.9-.5 3-2.1.0-2.1 0-.5-3L12 4.2zM5.2 8.9l2.4.8.9 2.9-1.8 2.2-2.3-.8a8 8 0 01.8-5.1zm13.6 0a8 8 0 01.8 5.1l-2.3.8-1.8-2.2.9-2.9 2.4-.8zM9 18.7l-1-2.7 1.7-2.1h4.6l1.7 2.1-1 2.7a8 8 0 01-6 0z" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-heading text-xl font-bold uppercase tracking-tight ${
            light ? "text-white" : "text-navy"
          }`}
        >
          Soccer<span className="text-brand-sky">Dad</span>HQ
        </span>
        <span
          className={`font-heading text-[10px] font-medium uppercase tracking-[0.2em] ${
            light ? "text-slate-300" : "text-slate-400"
          }`}
        >
          Florida Youth Soccer
        </span>
      </span>
    </Link>
  );
}
