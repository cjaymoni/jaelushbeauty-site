"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isActivePath, type NavLink } from "@/lib/nav";


// Reads a duration token in ms. The CSS minifier may rewrite "250ms" as ".25s".
function cssTimeMs(name: string, fallback: number) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) return fallback;
  return v.endsWith("ms") ? n : v.endsWith("s") ? n * 1000 : n;
}

/**
 * Phone menu: a native <details> disclosure (keyboard and screen-reader
 * support come free) whose panel uses the menu dropdown transition
 * (transitions-dev #5). Opening and closing are intercepted so the panel
 * can animate out before <details> hides it.
 */
export default function MobileMenu({ links }: { links: NavLink[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const pathname = usePathname();

  function open() {
    const d = detailsRef.current;
    const p = panelRef.current;
    if (!d || !p) return;
    window.clearTimeout(closeTimer.current);
    p.classList.remove("is-closing");
    d.open = true;
    void p.offsetHeight; // start from the pre-open scale
    p.classList.add("is-open");
  }

  function close(instant = false) {
    const d = detailsRef.current;
    const p = panelRef.current;
    if (!d || !p || !d.open) return;
    p.classList.remove("is-open");
    if (instant) {
      d.open = false;
      return;
    }
    p.classList.add("is-closing");
    const ms = cssTimeMs("--dropdown-close-dur", 250);
    closeTimer.current = window.setTimeout(() => {
      p.classList.remove("is-closing");
      d.open = false;
    }, ms);
  }

  // Close after client-side navigation.
  useEffect(() => close(true), [pathname]);

  // Escape closes and returns focus to the button.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && detailsRef.current?.open) {
        close();
        detailsRef.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <details className="mobile-menu" ref={detailsRef}>
      <summary
        onClick={(e) => {
          e.preventDefault();
          if (detailsRef.current?.open && panelRef.current?.classList.contains("is-open")) close();
          else open();
        }}
      >
        <span className="sr-only">Menu</span>
        <svg className="icon-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg className="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </summary>
      <nav aria-label="Main" className="t-dropdown" data-origin="top-right" ref={panelRef}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActivePath(pathname, l.href) ? "page" : undefined}
                onClick={() => close()}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
