import { GradientPanel } from "./Crest";
import CompactShare from "./CompactShare";
import { timeAgo } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";

const CAT_COLOR: Record<string, string> = {
  ECNL: "#1a4fa0",
  "MLS NEXT": "#1d7a4d",
  "Girls Academy": "#9b2d2d",
  "Girls Soccer": "#9b2d2d",
  "Boys Soccer": "#2a7de1",
  "High School": "#5a2d82",
  Recruiting: "#e8a020",
  Tournaments: "#5a2d82",
  "Parent Life": "#0d7a6f",
  Opinion: "#142844",
};

function NewsImage({ item, className }: { item: NewsItem; className: string }) {
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.image} alt="" loading="lazy" className={`${className} object-cover`} />;
  }
  return <GradientPanel seed={item.id} color={CAT_COLOR[item.category] ?? "#1a4fa0"} className={className} label={item.category} />;
}

function Source({ item }: { item: NewsItem }) {
  return (
    <p className="mt-2 text-sm">
      <span className="font-heading font-bold uppercase tracking-wide text-brand-blue">{item.source}</span>
      <span className="ml-2 text-slate-400">{timeAgo(item.published)}</span>
    </p>
  );
}

export default function HomeNews({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;
  const [feature, ...rest] = items;
  const cards = rest.slice(0, 6);

  return (
    <div className="flex h-full flex-col">
      {/* Featured */}
      <div className="group relative grid overflow-hidden rounded-2xl ring-1 ring-slate-100 transition-shadow hover:shadow-card-hover sm:grid-cols-2">
        <a href={feature.link} target="_blank" rel="noopener noreferrer" aria-label={feature.title} className="absolute inset-0 z-[1]" />
        <div className="absolute right-3 top-3 z-[2]">
          <CompactShare url={feature.link} title={feature.title} />
        </div>
        <NewsImage item={feature} className="aspect-[16/10] w-full sm:aspect-auto sm:h-full" />
        <div className="flex flex-col justify-center bg-white p-6 sm:p-8">
          <span className="chip-sky w-fit">{feature.category}</span>
          <h3 className="mt-3 font-heading text-2xl font-bold leading-tight text-navy group-hover:text-brand-sky sm:text-3xl">
            {feature.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-slate-600">{feature.excerpt}</p>
          <Source item={feature} />
        </div>
      </div>

      {/* Three cards */}
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {cards.map((item) => (
          <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-xl ring-1 ring-slate-100 transition-shadow hover:shadow-card">
            <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={item.title} className="absolute inset-0 z-[1]" />
            <div className="absolute right-3 top-3 z-[2]">
              <CompactShare url={item.link} title={item.title} />
            </div>
            <NewsImage item={item} className="aspect-[16/9] w-full" />
            <div className="flex flex-1 flex-col bg-white p-4">
              <h3 className="font-heading text-lg font-bold leading-snug text-navy group-hover:text-brand-sky">
                {item.title}
              </h3>
              <div className="mt-auto">
                <Source item={item} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
