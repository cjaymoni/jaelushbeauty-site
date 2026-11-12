"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBasket } from "./BasketProvider";

/** How long add buttons show their "added" state. */
export const ADDED_FEEDBACK_MS = 1800;

/**
 * Adds to the basket and reports `added` as true for a moment afterwards, so
 * a button can swap to a tick. Repeated clicks restart the timer.
 */
export function useAddedFeedback() {
  const { add } = useBasket();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const addWithFeedback = useCallback(
    (slug: string, quantity: number, label: string) => {
      add(slug, quantity, label);
      setAdded(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
    },
    [add],
  );

  return { added, add: addWithFeedback };
}
