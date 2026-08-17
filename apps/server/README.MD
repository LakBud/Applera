# Applera: Backend

Express + TypeScript REST API powering the Applera job application platform.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose
- **Auth**: Clerk (JWT, header-based) + signed guest-session cookie for anonymous requests
- **AI**: [vern-llm](https://vernllm.vercel.app) resilience layer over Mistral (primary) with
  Groq (fallback) — retries, timeouts, circuit breaking, local rate limiting, and caching behind
  one typed interface
- **File storage**: Cloudinary
- **Cache / Rate limiting**: Upstash Redis
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm@11.8.0
- MongoDB Atlas account
- Clerk account
- Mistral API key
- Groq API key
- Cloudinary account
- Upstash Redis account
- [ngrok](https://ngrok.com/download) or [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (for local webhook testing)

### Installation

From the repo root:

```bash
pnpm install
```

Or from this directory:

```bash
cd apps/server
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.development` and `.env.production` and fill in the values:

```bash
cp .env.example .env.development
cp .env.example .env.production
```

| Variable                     | Required | Description                                                     |
| ----------------------------- | -------- | ----------------------------------------------------------------- |
| `NODE_ENV`                   | Yes      | `development` or `production` if deployment (render)            |
| `PORT`                       | No       | Server port (default: 5005)                                     |
| `CLIENT_URL`                 | No       | Frontend URL for CORS (default: http://localhost:5173)          |
| `MONGO_URI`                  | Yes      | MongoDB Atlas connection string                                 |
| `MISTRAL_API_KEY`            | Yes      | Mistral API key — primary AI provider                           |
| `MISTRAL_MODEL`              | No       | Model to use (default: `mistral-small-latest`)                  |
| `MISTRAL_REQUESTS_PER_MINUTE`| No       | Local rate limit cap, tune to your Mistral plan (default: 250)  |
| `MISTRAL_TOKENS_PER_MINUTE`  | No       | Local rate limit cap, tune to your Mistral plan (default: 150000) |
| `MISTRAL_MAX_CONCURRENT`     | No       | Local concurrency cap, tune to your Mistral plan (default: 20)  |
| `GROQ_API_KEY`                | Yes      | Groq API key — fallback AI provider                             |
| `GROQ_MODEL`                  | No       | Model to use (default: `qwen/qwen3.6-27b`)                      |
| `GROQ_REQUESTS_PER_MINUTE`    | No       | Local rate limit cap, tune to your Groq plan (default: 250)     |
| `GROQ_TOKENS_PER_MINUTE`      | No       | Local rate limit cap, tune to your Groq plan (default: 150000)  |
| `GROQ_MAX_CONCURRENT`         | No       | Local concurrency cap, tune to your Groq plan (default: 20)     |
| `CLERK_SECRET_KEY`           | Yes      | Clerk secret key (use `sk_test_...` for dev)                    |
| `CLERK_PUBLISHABLE_KEY`      | Yes      | Clerk publishable key (use `pk_test_...` for dev)                |
| `CLERK_WEBHOOK_SECRET`       | Yes      | Clerk webhook signing secret                                     |
| `COOKIE_SECRET`              | Yes      | Secret for cookie signing                                        |
| `UPSTASH_REDIS_REST_URL`     | Yes      | Upstash Redis REST URL                                           |
| `UPSTASH_REDIS_REST_TOKEN`   | Yes      | Upstash Redis REST token                                         |
| `CLOUDINARY_CLOUD_NAME`      | Yes      | Cloudinary cloud name                                            |
| `CLOUDINARY_API_KEY`         | Yes      | Cloudinary API key                                               |
| `CLOUDINARY_API_SECRET`      | Yes      | Cloudinary API secret                                            |

> **Why two AI providers?** The LLM client (`src/services/llm/llm.service.ts`) is built on
> [vern-llm](https://vernllm.vercel.app), which wraps Mistral as the primary provider and
> automatically retries against Groq if Mistral is down, rate limited past recovery, or its
> circuit opens. Each provider has its own independent circuit breaker and rate limiter. Groq's
> current free-tier text models (`openai/gpt-oss-120b`, `qwen/qwen3.6-27b`) have shown
> inconsistent structured JSON output in production, so Groq was demoted to fallback rather than
> dropped entirely.

### Webhook Setup

Clerk sends `user.created`, `user.updated`, and `user.deleted` events to `/api/webhooks/clerk`, which syncs the `User` collection in MongoDB. These webhooks require a publicly reachable URL, so local development needs a tunnel.

> **Use your Clerk development instance keys (`sk_test_...` / `pk_test_...`) locally.** Local webhooks should point at your dev Clerk instance, not production — keep the two configured separately in Clerk's dashboard.

1. **Start a tunnel** to your local server (default port `5005`, or whatever `PORT` is set to):

   Using `cloudflared`:

   ```bash
   cloudflared tunnel --url http://localhost:5005
   ```

   Or using `ngrok`:

   ```bash
   ngrok http 5005
   ```

   Either will print a public HTTPS URL (e.g. `https://xxxx.trycloudflare.com` or `https://xxxx.ngrok-free.app`). Note that free-tier URLs change on every restart — if you want a stable URL, set up a [named Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/) routed to a subdomain you control.

2. **Register the webhook endpoint** in Clerk's dashboard, under your **development instance**:
   - Go to **Webhooks** → **Add Endpoint**
   - URL: `<your-tunnel-url>/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`

3. **Copy the signing secret** Clerk generates for this endpoint into `CLERK_WEBHOOK_SECRET` in `.env.development`.

4. **Verify it's working** — sign up or update your profile via the app (or use Clerk's "Send test event" button), and confirm the corresponding `[webhook]` log line appears in your server output.

Without this setup, no `User` document will be created on sign-up locally, which will cause user-dependent routes (e.g. CV pinning) to fail with "not found" style errors even though the request itself is valid.

### Download Skill Aliases (or use the one currently on the repo)

Follow steps here: [scripts/README.md](scripts/README.md).

### Development

From the repo root:

```bash
pnpm dev:server
```

Or from this directory:

```bash
pnpm dev
```

Starts the server with `tsx watch` for hot reloading on `http://localhost:5005`.

### Production Build

```bash
pnpm build  # compiles TypeScript to dist/
pnpm start  # runs dist/server.mjs
```

## Project Structure

```
scripts/
├── data/
│ ├── input/
│ └── output/
├── buildSkillAliases.ts
└── README.md
src/
├── config/
├── controllers/
├── lib/
├── middleware/
│ ├── auth/
│ ├── pdf/
│ ├── rate/
│ ├── request/
│ └── upload/
├── models/
├── prompts/
│ └── application/
├── routes/
├── services/
│ ├── application/
│ ├── audit/
│ ├── match/
│ └── pipeline/
├── types/
│ └── schemas/
├── utils/
│ ├── match/
│ └── shared/
├── workers/
└── server.ts
```

## API Routes

| Method | Path                  | Description                     |
| ------ | --------------------- | ------------------------------- |
| GET    | `/health`             | Health check                    |
| POST   | `/api/webhooks/clerk` | Clerk webhook handler           |
| `*`    | `/api/cv`             | CV upload, parsing, management  |
| `*`    | `/api/job`            | Job listing management          |
| `*`    | `/api/application`    | Application generation          |
| `*`    | `/api/interview`      | Interview prep generation       |
| `*`    | `/api/tracker`        | Application status and tracking |
| `*`    | `/api/dashboard`      | Dashboard stats                 |

## Middleware

Routes apply middleware in a deliberate order depending on their requirements. Common stages include:

1. **Concurrency control** — limits parallel in-flight requests for expensive operations
2. **Rate limiting** — applies route-specific limits (for example parse, application, or interview preparation flows)
3. **Uploads** — handles multipart uploads and validates file input (such as multer and magic byte checks)
4. **Parsing** — extracts and normalizes uploaded content (for example PDF text extraction)
5. **Request validation** — Zod validates and sanitizes request body, params, and query data
6. **Idempotency** — prevents duplicate processing where required
7. **Usage limiting** — checks and consumes AI quota after request validation succeeds
8. **Timeout** — enforces a request deadline for long-running operations, including AI calls
9. **Response validation hook** — validates and sanitizes successful responses before they are sent
10. **Controller** — executes route-specific business logic

## Identity & Sessions

- Authenticated requests are verified via **Clerk JWT**, sent as a Bearer token in the
  `Authorization` header — Clerk does not set its own session cookie in this app.
- Unauthenticated requests are assigned a **signed guest-session cookie** (30-day expiry,
  `httpOnly`), so rate limits can be applied per visitor rather than per shared IP. Guest
  sessions are never merged into an account if the visitor later signs up.
- `requireUser` blocks all protected routes for guest identities; guest identity currently
  exists solely to support fair per-visitor rate limiting, not to grant access to any
  functionality.

## Security

- Helmet for HTTP security headers
- CORS restricted to frontend domain
- CSRF protection via double-submit cookie pattern, covering the cookie-based fallback path
  (Clerk's header-based JWT auth is CSRF-safe by default)
- Rate limiting via Upstash Redis — keyed by user/guest identity on most routes, and by IP
  address on unauthenticated routes such as webhooks
- MongoDB query filter sanitization via `mongoose.set('sanitizeFilter', true)`
- Input sanitization (HPP, object stripping)
- MongoDB ObjectId validation at request boundaries
- Clerk JWT verification on all protected routes
- Svix signature verification on webhook endpoint
- IPv4 and IPv6 address masking in logs and audit records
- **Audit logging** — key account/application events (sign-ins, CV/job/application changes,
  rate-limit hits, guest session creation) are pushed to a Redis queue, consumed by a
  background worker, and persisted to MongoDB with a masked IP and a 90-day retention window,
  for abuse detection and investigation. Failed or malformed entries are routed to a dead-letter
  queue rather than dropped.

## CV & Job Match Algorithm

The matching engine scores how well a candidate's CV fits a job posting using a **hybrid math + AI approach**, balancing speed/cost against nuance.

Main pipeline:
[src/services/match/match.service.ts](src/services/match/match.service.ts)

**1. Deterministic math pass (always runs)**

- **Skill matching** — skills are normalized (casing, punctuation) and resolved through an alias map (e.g. `"Node.js"` and `"NodeJS"` → same canonical skill) so semantically identical skills match even when phrased differently. See [scripts/README.md](scripts/README.md) for how the alias map is built and curated.
- **Text overlap** — CV and job text are flattened and compared for word overlap, with language auto-detected so stopwords are stripped correctly (not just English).
- These combine into a weighted score: **60% skill match, 40% text overlap**, plus seniority fit, domain mismatch detection, and a confidence rating based on data quality.

**2. AI enrichment pass (conditional)**
The LLM is only called when the math pass is ambiguous — low confidence, or a score in the 30–75 "unclear" range. Clear strong/weak matches skip AI entirely, keeping most matches fast and free of LLM cost.

**3. Caching**
Both passes are cached by content hash (CV + job + version), so identical CV/job pairs never get re-scored or re-billed.

## AI Usage Limits

LLM-backed routes are protected by per-route, sliding-window rate limits (via Upstash Redis),
keyed by account or guest identity. The usage limiter runs after all validation middleware so
invalid or rejected requests never consume a request against the limit. Current limits:

- `POST /api/cv` — CV extraction (1 LLM call); parse limiter: 20 requests / 10 minutes
- `POST /api/job` — Job extraction (1 LLM call); parse limiter: 20 requests / 10 minutes
- `POST /api/application` — Match scoring + application generation (up to 3 LLM calls);
  application limiter: 15 requests / hour
- `POST /api/interview/:id` — Interview prep generation (1 LLM call); interview prep limiter:
  10 requests / hour

A global fallback limiter (300 requests / 15 minutes per identity) applies across all routes.

> Note: the `plan` field on the `User` model is reserved for a possible future paid tier and is not
> currently used to gate access or adjust limits.

## Account Deletion

When a user deletes their account via Clerk, a `user.deleted` webhook fires and automatically:

1. Deletes all Cloudinary PDF assets
2. Deletes all CVs, Jobs, Applications, and InterviewPreps from MongoDB
3. Deletes the user record

Audit log entries associated with the account are **not** deleted as part of this flow — they
are retained for up to 90 days for security purposes, independent of account or record deletion.

## AI Provider Resilience

The LLM client (`src/services/llm/llm.service.ts`) is built on
[vern-llm](https://vernllm.vercel.app), a resilience layer for LLM calls: retries, timeouts,
caching, and circuit breaking behind one typed interface, with independent configuration per
provider.

- **Primary**: Mistral (`mistral-small-latest` by default)
- **Fallback**: Groq (`qwen/qwen3.6-27b` by default) — automatically retried if Mistral is down,
  rate limited past recovery, or its circuit opens
- Both providers have their own circuit breaker, their own local rate limiter (proactively
  staying under each provider's request/token/concurrency limits before a call is ever sent),
  and their own retry budget
- A `400` response is treated as retryable rather than immediately fatal, since a JSON generation
  failure from either provider (e.g. Groq's `json_validate_failed`) is usually a one-off sampling
  issue rather than a genuinely malformed request

Groq previously ran as primary on `llama-3.3-70b-versatile`, which Groq deprecated in June 2026
and fully decommissioned in August 2026. Both of Groq's own recommended replacements
(`openai/gpt-oss-120b`, `qwen/qwen3.6-27b`) showed inconsistent structured JSON output in
production — the exact workload this app depends on for CV/job extraction — so Groq was demoted
to fallback rather than dropped, and Mistral was promoted to primary after proving reliable on
the same workload.

## Deployment

Deployed on [Render](https://render.com).

- **Build command**: `pnpm install && pnpm build:server`
- **Start command**: `pnpm start:server:prod`
- All environment variables are set in the Render dashboard