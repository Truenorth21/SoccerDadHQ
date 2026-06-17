/** Native <details> section — collapses to a single header row so the admin page
 *  isn't cluttered. No JS needed; open state is per-user via the browser. */
export default function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group mt-6 overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-navy">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <svg className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 20 20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <div className="border-t border-slate-100 p-5">{children}</div>
    </details>
  );
}
