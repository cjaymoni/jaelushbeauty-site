/** Small stroke icons shared by the basket controls. Each takes the class the add buttons animate. */

export function CheckIcon({ size }: { size: number }) {
  return (
    <svg className="icon-check" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** `strokeWidth` is lighter for large, decorative uses such as the empty basket. */
export function BagIcon({ size, strokeWidth = 2 }: { size: number; strokeWidth?: number }) {
  return (
    <svg className="icon-bag" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}
