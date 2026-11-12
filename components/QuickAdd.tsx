"use client";

import { MAX_QUANTITY_PER_LINE, remainingQuantity } from "@/lib/basket";
import { useBasket } from "./BasketProvider";
import { CheckIcon } from "./icons";
import { useAddedFeedback } from "./useAddedFeedback";

/** Round "+" button laid over a product card's photo. Adds one and briefly shows a tick. */
export default function QuickAdd({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const { added, add } = useAddedFeedback();
  const { lines } = useBasket();
  const full = remainingQuantity(lines, slug) === 0;
  return (
    <button
      type="button"
      className={`quick-add${added ? " is-added" : ""}${className ? ` ${className}` : ""}`}
      aria-label={full ? `${label}: limit of ${MAX_QUANTITY_PER_LINE} reached` : `Add ${label} to basket`}
      title={full ? `Limit of ${MAX_QUANTITY_PER_LINE} per order` : undefined}
      disabled={full}
      onClick={() => add(slug, 1, label)}
    >
      <svg className="icon-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <CheckIcon size={20} />
    </button>
  );
}
