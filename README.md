# Kelwin AI

AI-powered job application agent that autonomously fills and submits job applications on your behalf. Upload your resume, connect your portal credentials, and let the browser-use agent handle the rest.

Live at [kelwin.app](https://kelwin.app)
Dashboard at [Platform.kelwin.app](https://platform.kelwin.app/dashboard)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Next.js API Routes, Firebase Admin SDK, Cloud Tasks |
| Worker | Python (FastAPI), browser-use, Playwright, Gemini 3.6 Flash |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| Payments | Razorpay Subscriptions |
| Infra | Google Cloud Run (2 services), Artifact Registry |

## AI Agent

The worker runs a multi-step browser automation agent powered by [browser-use](https://github.com/browser-use/browser-use) and Gemini 3.6 Flash:

1. **Analysis** - Navigates to the job URL, detects the application form, and extracts all fields (inputs, dropdowns, screening questions) as structured JSON
2. **Login** - Authenticates into job portals (Greenhouse, Lever, Workday, etc.) using encrypted stored credentials
3. **Form Fill** - Maps resume data to form fields, answers screening questions, uploads resume, and fills the complete application
4. **Final Submit** - Submits the form, handles OTP/verification codes, and confirms successful submission

Each step runs in an isolated Playwright browser session on Cloud Run (4 CPU / 4 GB / 900s timeout). Firestore transactions prevent duplicate task execution on retries.

## Architecture

```text
Browser (React)                  Next.js API Routes              Cloud Tasks             Worker (Cloud Run)
     |                                  |                            |                         |
     |-- Apply to Job ---------------->  |                            |                         |
     |                                  |-- Enqueue task ----------> |                         |
     |                                  |                            |-- POST /tasks/analysis ->|
     |                                  |                            |                         |-- Launch browser
     |                                  |                            |                         |-- Extract fields
     |                                  |                            |                         |-- Write to Firestore
     |<-- Real-time Firestore snapshot --|                            |                         |
     |                                  |                            |                         |
     |-- Confirm/Edit Fields --------->  |                            |                         |
     |                                  |-- Enqueue final_submit --> |                         |
     |                                  |                            |-- POST /tasks/submit --->|
     |                                  |                            |                         |-- Fill & submit form
     |                                  |                            |                         |-- Increment usage
     |<-- Status: applied --------------|                            |                         |
```

**Platform service** (`asia-southeast1`) - Next.js app serving the dashboard, API routes, and static pages.

**Worker service** (`asia-south1`) - Python FastAPI running browser-use agents with Playwright in headless Chromium.

## Application Pipeline

```text
create -> analyzing -> waiting_for_review -> submitting -> applied
              |              |                     |
              v              v                     v
       waiting_for_credentials            waiting_for_otp
              |                                   |
              v                                   v
          applying                           submitting
```

1. User clicks **Apply** on a job listing
2. Platform validates subscription/usage limits, creates application doc, enqueues analysis task
3. Worker analyzes the page, extracts form fields, stores results in Firestore
4. User reviews pre-filled answers in the dashboard, edits if needed, confirms
5. Worker fills the form in a real browser, submits, handles any verification codes
6. Daily usage counter increments on successful submission

## Subscription & Billing

| Plan | Price | Daily Limit |
|------|-------|-------------|
| Pro | Free | 25 AI applies/day |
| Unlimited | INR 199/month | Unlimited |

Usage resets daily via date-keyed Firestore documents (`{userId}_{YYYY-MM-DD}`) - no cron required. Razorpay webhooks manage subscription lifecycle.

## Local Development

```bash
# Platform
npm install
cp .env.example .env.local  # fill in values
npm run dev

# Worker
cd worker
pip install -r requirements.txt
playwright install chromium
uvicorn src.main:app --reload --port 8080
```

## Deployment

Both services deploy to Cloud Run. The platform requires build-time args for client-side env vars:

```bash
# Platform (uses cloudbuild.yaml for NEXT_PUBLIC_* build args)
gcloud builds submit --config=cloudbuild.yaml

# Worker
gcloud run deploy kelwin-worker --source ./worker --region asia-south1 \
  --cpu 4 --memory 4Gi --timeout 900
```

`NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` are baked at build time via Docker build args. Runtime secrets are set via `--set-env-vars` in the deploy step.
