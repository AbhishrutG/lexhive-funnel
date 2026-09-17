// One question, one set of clickable options. Auto-advances on click instead
// of requiring a separate "Next" button - fewer taps = less drop-off, which
// is the whole point of a qualification funnel (matches the example funnel's
// single-tap-to-advance pattern).
export default function QuestionStep({ step, onAnswer }) {
  return (
    <>
      <h2>{step.question}</h2>
      <div className="option-list">
        {step.options.map((option) => (
          <button
            key={option}
            type="button"
            className="option-button"
            onClick={() => onAnswer(step.id, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
}
