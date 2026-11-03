/** Arrow for "learn more" links (transitions-dev #24). Put `t-learn` on the hovered parent. */
export default function Chevron() {
  return (
    <span className="t-learn-chevron" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
        <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
      </svg>
    </span>
  );
}
