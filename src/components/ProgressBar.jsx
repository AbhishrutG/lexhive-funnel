// Discrete filled segments instead of a smooth gradient bar. The content
// really is a fixed sequence of steps (3 questions + contact info), so
// showing "Step 2 of 4" and a segment-per-step is concrete progress info,
// not decoration - a smooth bar implies continuous progress we don't have.
export default function ProgressBar({ current, total }) {
  return (
    <div className="step-meta">
      <div className="step-segments" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`step-segment${i < current ? ' is-filled' : ''}`} />
        ))}
      </div>
      <span className="step-count">
        Step {current} of {total}
      </span>
    </div>
  );
}
