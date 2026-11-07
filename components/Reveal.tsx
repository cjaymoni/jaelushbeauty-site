"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Texts reveal (transitions-dev #18): children marked with `line(n)` rise in,
 * one after another, the first time the block scrolls into view.
 */
export default function Reveal({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-shown");
          io.disconnect();
        }
      },
      // Fire as soon as any part enters the view. A ratio threshold (e.g. 0.15)
      // can never be reached by a block taller than the viewport divided by
      // that ratio, such as a long product grid on a short or zoomed screen.
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`t-stagger ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
