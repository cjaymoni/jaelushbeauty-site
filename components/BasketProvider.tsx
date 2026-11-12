"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { basketItemCount, basketReducer, parseBasket, type BasketLine } from "@/lib/basket";

/** Versioned so a future change to the stored shape can ignore old data. */
const STORAGE_KEY = "jaelush-basket-v1";

type BasketContextValue = {
  lines: BasketLine[];
  count: number;
  /** False until the saved basket has been read, so the page can avoid flashing "empty". */
  ready: boolean;
  /** Adds products and announces it to screen readers, e.g. "Glow Bar added to your basket". */
  add: (slug: string, quantity: number, label: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string, label: string) => void;
  clear: () => void;
};

const BasketContext = createContext<BasketContextValue | null>(null);

function readStored(knownSlugs: ReadonlySet<string>): BasketLine[] {
  try {
    return parseBasket(window.localStorage.getItem(STORAGE_KEY), knownSlugs);
  } catch {
    // Storage can be blocked (private mode, site data disabled). Start with an empty basket.
    return [];
  }
}

function writeStored(lines: BasketLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch (error) {
    // The basket still works for this visit; it just won't survive a reload.
    console.warn("Could not save the basket to localStorage", error);
  }
}

/**
 * Holds the basket for the whole site and keeps it in localStorage, so it
 * survives reloads and stays in step across tabs. `slugs` is the catalog's
 * product list, used to drop products that no longer exist.
 */
export default function BasketProvider({ slugs, children }: { slugs: string[]; children: React.ReactNode }) {
  const knownSlugs = useMemo(() => new Set(slugs), [slugs]);
  const [lines, dispatch] = useReducer(basketReducer, []);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    dispatch({ type: "replace", lines: readStored(knownSlugs) });
    setReady(true);

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) dispatch({ type: "replace", lines: parseBasket(e.newValue, knownSlugs) });
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [knownSlugs]);

  useEffect(() => {
    if (ready) writeStored(lines);
  }, [lines, ready]);

  const add = useCallback((slug: string, quantity: number, label: string) => {
    dispatch({ type: "add", slug, quantity });
    setAnnouncement(`${label} added to your basket`);
  }, []);
  const setQuantity = useCallback((slug: string, quantity: number) => dispatch({ type: "set", slug, quantity }), []);
  const remove = useCallback((slug: string, label: string) => {
    dispatch({ type: "remove", slug });
    setAnnouncement(`${label} removed from your basket`);
  }, []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo(
    () => ({ lines, count: basketItemCount(lines), ready, add, setQuantity, remove, clear }),
    [lines, ready, add, setQuantity, remove, clear],
  );

  return (
    <BasketContext.Provider value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </BasketContext.Provider>
  );
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside <BasketProvider>");
  return ctx;
}
