import { useEffect, useRef, useState } from 'react';
import ProgressBar from './components/ProgressBar';
import BackgroundTrace from './components/BackgroundTrace';
import QuestionStep from './components/QuestionStep';
import ContactStep from './components/ContactStep';
import ThankYou from './components/ThankYou';
import { QUALIFYING_STEPS, TOTAL_STEPS } from './data/funnelSteps';
import { initMetaPixel, generateEventId, getFbp, getFbc, trackLeadEvent } from './lib/meta';
import { submitLead } from './lib/submitLead';
import './App.css';

// The funnel is one state machine, not one React Route per step. WHY: this
// whole app is six screens deep in a single linear flow with no back button
// in the original example - a router would add a dependency and URL-state
// bugs for zero benefit here. `stepIndex` walking through QUALIFYING_STEPS
// and then into the two fixed steps (contact, thank-you) is the entire flow.
function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | error | done

  // Generated once per page load and reused on every retry - this is the
  // event_id that ties the browser-side Pixel event and the server-side CAPI
  // event together (see lib/meta.js). Keeping it in a ref (not state) means
  // it survives re-renders but never triggers one itself.
  const eventIdRef = useRef(generateEventId());

  useEffect(() => {
    initMetaPixel();
  }, []);

  function handleAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setStepIndex((i) => i + 1);
  }

  // Also called again on retry (ContactStep re-invokes the same onSubmit
  // when the user clicks the button after an error). Because eventIdRef
  // never changes for the life of the page, a retry always resends the exact
  // same event_id - so a flaky network turning into two fetch calls never
  // turns into two counted leads on Meta's side.
  async function handleContactSubmit(contactForm) {
    setSubmitState('submitting');

    // Fire the client-side Pixel event right when the user submits - this is
    // the moment closest to real intent, and it's what most ad platforms
    // expect for "Lead" timing.
    trackLeadEvent(eventIdRef.current);

    const payload = {
      event_id: eventIdRef.current,
      submitted_at: new Date().toISOString(),
      contact: contactForm,
      answers,
      tracking: {
        fbp: getFbp(),
        fbc: getFbc(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      },
    };

    try {
      await submitLead(payload);
      setSubmitState('done');
      setStepIndex((i) => i + 1);
    } catch (err) {
      // Deliberately NOT advancing the step and NOT regenerating event_id.
      // The user sees a retry button; when they click it, the exact same
      // event_id and payload go out again, so a flaky network doesn't turn
      // into a duplicate lead or a duplicate ad conversion once it succeeds.
      console.error('Lead submission failed:', err);
      setSubmitState('error');
    }
  }

  const isQualifying = stepIndex < QUALIFYING_STEPS.length;
  const isContact = stepIndex === QUALIFYING_STEPS.length;
  const isThankYou = stepIndex > QUALIFYING_STEPS.length;

  return (
    <div className="funnel">
      <BackgroundTrace />
      <div className="funnel-inner">
        {!isThankYou && <ProgressBar current={stepIndex + 1} total={TOTAL_STEPS - 1} />}

        {stepIndex === 0 && (
          <div className="hook">
            <p className="stat-label">The average small business wastes</p>
            <p className="stat-number">32%</p>
            <p className="stat-caption">
              of its ad budget on leads that are never properly tracked. Three quick
              questions — then a free audit of your setup.
            </p>
          </div>
        )}

        <div className={`step-card${isThankYou ? ' thank-you' : ''}`}>
          <div className="step-card-bar" />
          <div className="step-card-body">
            {isQualifying && (
              <QuestionStep step={QUALIFYING_STEPS[stepIndex]} onAnswer={handleAnswer} />
            )}
            {isContact && (
              <ContactStep onSubmit={handleContactSubmit} submitState={submitState} />
            )}
            {isThankYou && <ThankYou />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
