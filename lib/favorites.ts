"use client";

import { useCallback, useEffect, useState } from "react";

export type FavoriteType = "club" | "school" | "coach";

export interface Favorite {
  type: FavoriteType;
  slug: string;
  name: string;
  subtitle?: string;
  color?: string;
}

const KEY = "sdhq:favorites";
const EVENT = "sdhq:favchange";

function read(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: Favorite[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

/** Client hook for the favorites list, synced across components on the page. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isFav = useCallback(
    (type: FavoriteType, slug: string) => favorites.some((f) => f.type === type && f.slug === slug),
    [favorites]
  );

  const toggle = useCallback((item: Favorite) => {
    const list = read();
    const i = list.findIndex((f) => f.type === item.type && f.slug === item.slug);
    if (i >= 0) list.splice(i, 1);
    else list.unshift(item);
    write(list);
  }, []);

  return { favorites, isFav, toggle };
}
