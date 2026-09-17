# LexHive Lead Funnel

A short quiz funnel for a "Free Marketing Audit" offer. Someone answers three quick questions, leaves their contact info, and that lead gets tracked and saved automatically — with nothing lost even if something goes wrong along the way.

**Live site:** https://lexhive-funnel-phi.vercel.app
**Automation export:** [automation/lexhive-lead-intake.json](automation/lexhive-lead-intake.json)

## What this actually does

1. A visitor answers 3 questions (do they run ads, what's their budget, how urgent is it), then fills in name, business, email, and phone.
2. The moment they submit, their browser tells Facebook "a lead just happened," and at the same time sends the lead to an automation tool (n8n).
3. n8n scrambles the email/phone into a safe format, tells Facebook the same "lead" event a second time as a backup, and saves the lead into an Airtable spreadsheet.
4. If anything fails along the way, the visitor sees a real error message and can safely retry — retrying never creates a duplicate lead or double-counts the same person on Facebook.

The reasoning behind each of these decisions (why two Facebook events, why retries are safe, why data is scrambled, etc.) is written up in plain language in [CONTEXT.md](CONTEXT.md) and [ISSUE.md](ISSUE.md).

## What's used here, and why

| Tool | What it's for, in plain terms |
| --- | --- |
| **React** | Builds the actual quiz screens the visitor sees and clicks through. |
| **Vite** | Runs the project locally and bundles it for deployment — the "engine" behind the React app, not something visitors ever see. |
| **Meta Pixel** | A small script in the browser that tells Facebook "this visitor took an action" in real time. |
| **Meta Conversions API (CAPI)** | The server-side twin of the Pixel — sends the same "lead" event from the backend instead of the browser, as a backup that's harder to block. |
| **n8n** | A visual automation tool (think flowchart you can run) that receives the lead, processes it, and routes it to the right places — no custom backend server needed. |
| **Airtable** | A spreadsheet-like database where every lead ends up as a row, so a human can see and act on it. |
| **Vercel** | Hosts the live website so it has a real public link, instead of only running on one computer. |

## Running it locally

```bash
npm install
cp .env.example .env   # then fill in your own Pixel ID and n8n webhook URL
npm run dev
```

The app needs two values in `.env` to actually work:
- `VITE_META_PIXEL_ID` — from Meta Events Manager (Data Sources → Pixels)
- `VITE_N8N_WEBHOOK_URL` — the production webhook URL from the n8n workflow in `automation/`

## The automation side

The `automation/lexhive-lead-intake.json` file is a full export of the n8n workflow that receives leads from this site. Import it into n8n, connect your own Meta and Airtable credentials, and activate it — see [CONTEXT.md](CONTEXT.md) for the full step-by-step of what each node in that workflow does and why it's built the way it is.
