/** Class names for one staggered reveal line: `line(1)` goes first, `line(2)` next, … up to 6. */
export const line = (n: number) => `t-stagger-line t-stagger-line--${Math.min(n, 6)}`;
