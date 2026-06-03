export default function CategoryScores({
  categories,
  scores,
}: {
  categories: readonly { key: string; label: string }[];
  scores: Record<string, number>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {categories.map((c) => {
        const v = scores[c.key] ?? 0;
        return (
          <div key={c.key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-600">
                {c.label}
              </span>
              <span className="font-heading text-sm font-bold text-navy">{v.toFixed(1)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-sky"
                style={{ width: `${(v / 5) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
