import Link from "next/link";

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-white">
      <ol className="container-page flex items-center gap-1.5 py-2.5 text-sm text-slate-500">
        <li>
          <Link href="/" className="hover:text-brand-sky">Home</Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="text-slate-300">/</span>
            {it.href && i < items.length - 1 ? (
              <Link href={it.href} className="hover:text-brand-sky">{it.label}</Link>
            ) : (
              <span className="truncate font-medium text-navy">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
