"use client";

import { useFavorites, type Favorite } from "@/lib/favorites";

export default function FavoriteButton({
  item,
  size = "sm",
  floating = false,
}: {
  item: Favorite;
  size?: "sm" | "md";
  floating?: boolean;
}) {
  const { isFav, toggle } = useFavorites();
  const active = isFav(item.type, item.slug);
  const dim = size === "md" ? "h-9 w-9" : "h-8 w-8";

  return (
    <button
      type="button"
      onClick={(e) => {
        // Don't trigger the parent card link.
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
      title={active ? "Saved — click to remove" : "Save to favorites"}
      className={`grid ${dim} place-items-center rounded-full transition-colors ${
        floating ? "bg-white/90 shadow-sm backdrop-blur" : "bg-slate-100 hover:bg-slate-200"
      } ${active ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7.5-4.6-10-9.3C.6 8.3 2.2 5 5.4 5c2 0 3.3 1.1 4.6 2.6C11.3 6.1 12.6 5 14.6 5c3.2 0 4.8 3.3 3.4 6.7C19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
