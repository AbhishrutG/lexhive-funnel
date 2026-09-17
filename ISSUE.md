# Current Issue

## Symptom

On the live website, submitting the contact form always shows the error state:

> "Something went wrong sending your info. Nothing was lost — hit the button again."

This is the frontend's intended behavior when n8n responds with a non-2xx status (see `src/lib/submitLead.js` — it throws on any non-ok response, which `App.jsx` catches and turns into this message). So the frontend itself is working correctly; the problem is that **n8n is telling it something failed when it actually didn't.**

## What's actually happening in n8n

Everything upstream works:
- The webhook receives the lead ✅
- PII gets normalized and hashed ✅
- The Meta CAPI call fires ✅
- The Airtable "Upsert Lead to Airtable" node **successfully writes the row** — confirmed directly in the execution log, e.g. record `recXe5YJu7YpsA4Y4` with all correct fields (Business, Monthly Budget, Runs Ads, Email, Phone, Name, Urgency, Page URL, event_id, Meta Sync Status: Success) ✅

The problem is the very next node, **"Airtable Write OK?"** (an IF node meant to branch to a success or failure response). Its condition is supposed to check "did the Airtable write actually return a record ID," and route to `Respond Success` if yes, `Respond Error` if no.

Even when the input data clearly contains a non-empty `id` field (`recXe5YJu7YpsA4Y4`), the node still routes down the **False Branch** → `Respond Error` → the frontend shows the retry message.

## What's been tried

1. Original condition: `{{ $json.error }}` with operator "is empty" (String type) — intended logic: no error field present = success. This failed to route correctly, suspected cause: n8n's "is empty" string operator doesn't reliably treat a *completely missing* property as empty (as opposed to a field that exists but is blank).
2. Changed condition to: `{{ $json.id }}` with operator "is not empty" (String type) — intended logic: a real Airtable record ID present = success. Verified in the node's own input/output panel that `$json.id` is genuinely present and non-empty (`recXe5YJu7YpsA4Y4`) for this exact execution — **and it still routed to the False Branch.** This rules out a data problem; it points to the String-type "is not empty" operator itself behaving unexpectedly in this n8n instance/version.
3. In-progress fix (not yet confirmed working): switch the condition to **Boolean** type, using the expression `{{ !!$json.id }}` compared against `true` (via "is true"), to sidestep whatever quirk is happening with the String "is not empty"/"is empty" operators. `!!` forces a plain JavaScript boolean, removing any ambiguity around type validation.

## Next steps if the Boolean fix doesn't resolve it

- Replace the IF node entirely with the same pattern already used successfully elsewhere in this workflow: the "Record Meta Sync Result" Set node uses a plain ternary (`{{ $json.error ? 'Failed' : 'Success' }}`) inside an Edit Fields node, which does **not** exhibit this bug. The same approach (a Set node computing a `writeOk` boolean/string field via ternary, immediately followed by an IF node checking that pre-computed field) may be more reliable than asking the IF node's built-in operator to evaluate the raw field directly.
- Alternatively, restructure to avoid a branch entirely: have both `Respond Success` and `Respond Error` collapse into one `Respond to Webhook` node whose status code and body are set via expression (e.g. `{{ $json.id ? 200 : 500 }}`), removing the IF node from the equation.
- Worth checking n8n's own "Test condition" / evaluation preview (the small icon at the end of the condition row) next time, to see what boolean result n8n itself claims the condition produces for the given input — this would confirm whether it's a display/UI issue or a genuine evaluation bug.

## Why this matters for the assessment

The assessment explicitly grades "reliability of the lead flow." Right now the system has an inverted-logic bug that makes a **successful** lead submission look like a **failure** to the end user — which is arguably worse than a real failure, because a real lead thinks their submission didn't go through (and may abandon or resubmit unnecessarily) even though it's sitting correctly in Airtable. This needs to be fixed before recording the Loom walkthrough or considering the pipeline done.
