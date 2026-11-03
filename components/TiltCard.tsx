"use client";

import { useRef, type ReactNode } from "react";

const MAX = 16; // peak tilt in degrees at the card edges

/**
 * Card hover tilt (transitions-dev #19). The pointer is tracked on the flat
 * outer wrapper; the inner card leans toward it with a cursor-tracked glare.
 * Mouse only on this site, so touch users can still scroll past the cards.
 */
export default function TiltCard({
  children,
  className = "",
}: {
  /** The card itself; give it the class `t-tilt-card`. */
  children: ReactNode;
  className?: string;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);

  function card() {
    return tiltRef.current?.querySelector<HTMLElement>(".t-tilt-card") ?? null;
  }

  function reset() {
    const c = card();
    tiltRef.current?.classList.remove("is-hover");
    if (!c) return;
    c.classList.remove("is-tilting");
    c.style.setProperty("--tilt-rx", "0deg");
    c.style.setProperty("--tilt-ry", "0deg");
  }

  function track(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tilt = tiltRef.current;
    const c = card();
    if (!tilt || !c) return;
    const r = tilt.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    tilt.classList.add("is-hover");
    c.classList.add("is-tilting");
    c.style.setProperty("--tilt-ry", ((px - 0.5) * MAX).toFixed(2) + "deg");
    c.style.setProperty("--tilt-rx", ((0.5 - py) * MAX).toFixed(2) + "deg");
    c.style.setProperty("--tilt-gx", (px * 100).toFixed(1) + "%");
    c.style.setProperty("--tilt-gy", (py * 100).toFixed(1) + "%");
  }

  return (
    <div
      ref={tiltRef}
      className={`t-tilt ${className}`}
      onPointerMove={track}
      onPointerLeave={(e) => e.pointerType === "mouse" && reset()}
    >
      {children}
    </div>
  );
}
