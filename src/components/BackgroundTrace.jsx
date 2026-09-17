// Purely decorative, one-time visual gesture (see App.css .funnel-trace for
// the rationale). aria-hidden because it carries no information.
export default function BackgroundTrace() {
  return (
    <svg
      className="funnel-trace"
      viewBox="0 0 900 500"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 460C140 460 180 320 300 300C420 280 430 140 560 110C670 85 700 40 900 20"
        stroke="var(--signal)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="900" cy="20" r="5" fill="var(--signal)" />
    </svg>
  );
}
