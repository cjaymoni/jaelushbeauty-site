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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
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
