# Project Context

## What this is

This is a take-home assessment for the **Growth Automation Engineer** role at **LexHive Inc.** (formerly DemandLane), a 100% remote position reporting to the Mar-Tech Lead.

**Deadline:** 2026-09-18, 5:00 PM.

## What the assessment asks for

Build a lead-generation funnel that mirrors the pattern used at `funnel.disabilitypath.org/qualification-v30` — a multi-step qualification quiz that ends in a contact-capture form — then wire it into a resilient, trackable lead pipeline. Specifically:

1. **React funnel** — single-question-per-screen quiz, progress indicator, auto-advance, ending in a contact form.
2. **Meta tracking, done well** — both the browser-side Meta Pixel and the server-side Meta Conversions API (CAPI) need to fire for each lead, sharing one `event_id` so Meta deduplicates them into a single counted conversion instead of two. The assessment explicitly says they grade "event quality, matching, and deduplication" heavily.
3. **Lead routing automation** — n8n receives the lead via webhook, sends the CAPI event to Meta, and writes the lead into Airtable.
4. **Resilience** — failures must be visible and recoverable, not silent. No lead should vanish because of a flaky network call or a downstream API hiccup. Retries must not create duplicate leads or duplicate ad conversions.

**Deliverables:** live funnel URL, GitHub repo, n8n workflow export + Airtable base, a ≤5 min Loom walkthrough, and a ≤1 page write-up of assumptions/trade-offs.

## Why the funnel looks the way it does

The reference funnel (`disabilitypath.org`) is a **disability-benefits eligibility screener**, so it asks many questions (age, income, work history, diagnosis, etc.) because eligibility genuinely depends on all of them. Our funnel is a **B2B "Free Marketing Audit" lead-qualification funnel** instead — a different niche chosen deliberately to avoid replicating a vulnerable-population-targeting funnel. It borrows the reference's *interaction pattern* (one question per screen, auto-advance, progress bar, ends in contact capture) rather than its literal question count. Ours has 3 qualifying questions (`runs_ads`, `monthly_budget`, `urgency`) because that's enough to qualify a marketing lead — more questions before contact capture would just add drop-off with no matching benefit here.

## Architecture

```
React app (Vite, local dev on :5183, will deploy to Vercel)
  -> generates one event_id per page load
  -> fires Meta Pixel "Lead" event client-side on submit
  -> POSTs lead payload (contact info, quiz answers, event_id, fbp/fbc) to an n8n webhook
       |
       v
n8n workflow ("LexHive Lead Intake")
  1. Lead Webhook          - receives the POST
  2. Normalize + Hash PII  - lowercases/trims email, strips phone to digits, SHA-256 hashes both
  3. Send to Meta CAPI     - POST to graph.facebook.com/v19.0/{pixel_id}/events, reusing the same event_id
  4. Record Meta Sync Result - flags whether the Meta call succeeded, for visibility
  5. Upsert Lead to Airtable - writes/updates a row, matched on event_id (so retries never duplicate)
  6. Airtable Write OK?    - branches to a success or failure response back to the browser
  7. Respond Success / Respond Error - tells the frontend whether to show the thank-you screen or a retry prompt
```

## Why event_id is the core mechanism

The React app generates `event_id` once per page load (`useRef`, not `useState`, so it never changes on re-render) and reuses the exact same value on every retry. That one ID is sent to Meta twice — once from the browser Pixel, once from n8n's server-side CAPI call — and Meta treats matching `event_id`s as **one** deduplicated lead. If a new ID were generated on every retry, every flaky-network resubmission would double-count as a separate ad conversion. The same ID is also the **match key** for the Airtable upsert, so a retried webhook delivery updates the same row instead of creating a duplicate lead record.

## Current status (as of 2026-09-17)

- ✅ Airtable base ("Lexhive") + "Leads" table created via API, schema verified with a live write/read/delete test.
- ✅ Meta Business Portfolio, Pixel, and Conversions API access token created.
- ✅ n8n workflow imported, Airtable + Meta credentials wired in, workflow activated.
- ✅ End-to-end test confirms: lead data successfully reaches Airtable.
- ❌ **Blocking bug**: see `ISSUE.md`. The workflow's final branch logic misroutes a successful Airtable write down the "failure" path, so the frontend shows a false error to the user even though the lead was actually saved.
- ⏳ Not yet done: Vercel deployment, live URL, GitHub commits/push, Loom recording, 1-page write-up.
