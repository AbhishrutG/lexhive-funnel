// The funnel's questions live here as data, not as separate components/logic.
// WHY: adding, removing, or reordering a qualifying question is then a one-line
// change instead of touching App.jsx's rendering/routing logic. It also means
// the "quiz" and the "contact form" share one generic QuestionStep renderer.

export const QUALIFYING_STEPS = [
  {
    id: 'runs_ads',
    question: 'Does your business currently run paid ads (Google or Meta)?',
    options: ['Yes, actively', 'Used to, not anymore', 'Never tried it'],
  },
  {
    id: 'monthly_budget',
    question: "What's your monthly marketing budget?",
    options: ['Under $500', '$500 - $2,000', '$2,000 - $10,000', '$10,000+'],
  },
  {
    id: 'urgency',
    question: 'How soon are you looking to improve results?',
    options: ['Immediately', 'Within 1-3 months', 'Just exploring options'],
  },
];

export const TOTAL_STEPS = QUALIFYING_STEPS.length + 2; // + contact step + thank-you
