"use client";

import { MAX_QUANTITY_PER_LINE, clampQuantity } from "@/lib/basket";

/**
 * Minus / number / plus control. The number can also be typed. `min` is 1 on
 * product pages and in the basket; removing a line is a separate button so it
 * never happens by accident.
 */
export default function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = MAX_QUANTITY_PER_LINE,
  size = "regular",
}: {
  value: number;
  onChange: (quantity: number) => void;
  /** What is being counted, for screen readers, e.g. "Glow Bar". */
  label: string;
  min?: number;
  /** Highest value allowed, e.g. what still fits in the basket. Never above the per-line maximum. */
  max?: number;
  size?: "regular" | "small";
}) {
  const ceiling = Math.max(min, Math.min(max, MAX_QUANTITY_PER_LINE));
  const set = (n: number) => onChange(Math.min(ceiling, Math.max(min, clampQuantity(n))));
  return (
    <div className={`stepper${size === "small" ? " stepper-small" : ""}`} role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Decrease ${label}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M3.5 8h9" />
        </svg>
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={ceiling}
        value={value}
        aria-label={`${label} quantity`}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          // Ignore the momentary empty value while retyping; focus selects the number so typing replaces it.
          if (e.target.value !== "") set(Number(e.target.value));
        }}
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= ceiling}
        aria-label={`Increase ${label}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M3.5 8h9M8 3.5v9" />
        </svg>
      </button>
    </div>
  );
}
