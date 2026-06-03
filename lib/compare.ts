"use client";

import { useCallback, useEffect, useState } from "react";

export type CompareType = "club" | "school";
export interface CompareItem {
  type: CompareType;
  slug: string;
  name: string;
}

const KEY = "sdhq:compare";
const EVENT = "sdhq:comparechange";
export const MAX_COMPARE = 4;

function read(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list: CompareItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function useCompare() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const has = useCallback((type: CompareType, slug: string) => items.some((i) => i.type === type && i.slug === slug), [items]);
  const atMax = items.length >= MAX_COMPARE;

  const toggle = useCallback((item: CompareItem) => {
    const list = read();
    const i = list.findIndex((x) => x.type === item.type && x.slug === item.slug);
    if (i >= 0) list.splice(i, 1);
    else {
      // Compare one type at a time — switching types clears the tray.
      const sameType = list.filter((x) => x.type === item.type);
      if (sameType.length >= MAX_COMPARE) return;
      if (list.length && list[0].type !== item.type) list.length = 0;
      list.push(item);
    }
    write(list);
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, has, atMax, toggle, clear };
}
