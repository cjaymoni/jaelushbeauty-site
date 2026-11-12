"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BASKET_PATH, itemCountLabel } from "@/lib/basket";
import { useBasket } from "./BasketProvider";

/** Header link to the basket with a live item count. The badge pops when the count changes. */
export default function BasketLink() {
  const { count } = useBasket();
  const pathname = usePathname();
  return (
    <Link
      href={BASKET_PATH}
      className="basket-link"
      aria-label={`Basket, ${itemCountLabel(count)}`}
      aria-current={pathname === BASKET_PATH ? "page" : undefined}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
      </svg>
      <span className="basket-link-label" aria-hidden="true">
        Basket
      </span>
      {count > 0 && (
        // key restarts the pop animation on every change
        <span key={count} className="basket-badge" aria-hidden="true">
          {count}
        </span>
      )}
    </Link>
  );
}
