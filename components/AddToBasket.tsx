"use client";

import Link from "next/link";
import { useState } from "react";
import { BASKET_PATH, MAX_QUANTITY_PER_LINE, itemCountLabel, remainingQuantity } from "@/lib/basket";
import { useBasket } from "./BasketProvider";
import QuantityStepper from "./QuantityStepper";
import { BagIcon, CheckIcon } from "./icons";
import { useAddedFeedback } from "./useAddedFeedback";

/** Show the "you can add N more" hint once this few or fewer still fit. */
const LOW_REMAINING_HINT = 5;

/** Quantity picker and add button for a product page, with a link to the basket once something is added. */
export default function AddToBasket({ slug, label }: { slug: string; label: string }) {
  const { lines, count } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const inBasket = lines.find((l) => l.slug === slug)?.quantity ?? 0;
  const remaining = remainingQuantity(lines, slug);
  // Another tab or the basket page may have added more since this was picked.
  const toAdd = Math.max(1, Math.min(quantity, remaining));

  return (
    <div className="add-to-basket">
      <div className="add-to-basket-row">
        <QuantityStepper value={toAdd} onChange={setQuantity} label={label} max={Math.max(1, remaining)} />
        <AddToBasketButton
          slug={slug}
          label={label}
          quantity={toAdd}
          onAdded={() => setQuantity(1)}
          disabled={remaining === 0}
        />
      </div>
      {inBasket > 0 && (
        <p className="add-to-basket-note">
          {inBasket} in your basket ·{" "}
          <Link href={BASKET_PATH}>
            Review &amp; send order <span className="muted">({itemCountLabel(count)})</span>
          </Link>
        </p>
      )}
      {remaining < MAX_QUANTITY_PER_LINE && remaining <= LOW_REMAINING_HINT && (
        <p className="add-to-basket-note muted">
          {remaining === 0
            ? `That’s the limit of ${MAX_QUANTITY_PER_LINE} per order. For more, message us and we’ll arrange it.`
            : `You can add ${remaining} more (limit ${MAX_QUANTITY_PER_LINE} per order).`}
        </p>
      )}
    </div>
  );
}

/** Text button that adds a product and swaps its bag icon for a tick for a moment. */
export function AddToBasketButton({
  slug,
  label,
  quantity = 1,
  onAdded,
  disabled = false,
  className = "",
}: {
  slug: string;
  label: string;
  quantity?: number;
  onAdded?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const { added, add } = useAddedFeedback();
  return (
    <button
      type="button"
      className={`btn add-btn${added ? " is-added" : ""} ${className}`}
      disabled={disabled}
      onClick={() => {
        add(slug, quantity, quantity > 1 ? `${quantity} × ${label}` : label);
        onAdded?.();
      }}
    >
      <span className="add-btn-icon">
        <BagIcon size={18} />
        <CheckIcon size={18} />
      </span>
      {disabled ? "Basket limit reached" : added ? "Added" : "Add to basket"}
    </button>
  );
}
