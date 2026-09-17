// Sends the finished lead to the n8n webhook. Kept separate from meta.js so
// the "what does a lead look like" concern is separate from "how do we track
// ad conversions" - two different jobs, two different files.
//
// WHY throw on non-2xx instead of swallowing the error: App.jsx needs to know
// submission failed so it can show a retry button instead of the thank-you
// screen. Silently succeeding on a failed request would be exactly the
// "invisible failure" the assessment says to avoid.

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function submitLead(payload) {
  if (!WEBHOOK_URL) {
    throw new Error('VITE_N8N_WEBHOOK_URL is not set - see .env.example');
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`n8n webhook returned ${res.status}`);
  }

  return res.json().catch(() => ({}));
}
