# Applera — Backend

Express + TypeScript REST API powering the Applera job application platform.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose
- **Auth**: Clerk
- **AI**: Groq (llama-3.3-70b-versatile)
- **File storage**: Cloudinary
- **Cache / Rate limiting**: Upstash Redis
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.20.0
- MongoDB Atlas account
- Clerk account
- Groq API key
- Cloudinary account
- Upstash Redis account

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

| Variable                   | Required | Description                                            |
| -------------------------- | -------- | ------------------------------------------------------ |
| `NODE_ENV`                 | No       | `development` or `production`                          |
| `PORT`                     | No       | Server port (default: 5005)                            |
| `CLIENT_URL`               | No       | Frontend URL for CORS (default: http://localhost:5173) |
| `MONGO_URI`                | Yes      | MongoDB Atlas connection string                        |
| `GROQ_API_KEY`             | Yes      | Groq API key                                           |
| `GROQ_MODEL`               | No       | Model to use (default: llama-3.3-70b-versatile)        |
| `CLERK_SECRET_KEY`         | Yes      | Clerk secret key                                       |
| `CLERK_PUBLISHABLE_KEY`    | Yes      | Clerk publishable key                                  |
| `CLERK_WEBHOOK_SECRET`     | Yes      | Clerk webhook signing secret                           |
| `COOKIE_SECRET`            | Yes      | Secret for cookie signing                              |
| `UPSTASH_REDIS_REST_URL`   | Yes      | Upstash Redis REST URL                                 |
| `UPSTASH_REDIS_REST_TOKEN` | Yes      | Upstash Redis REST token                               |
| `CLOUDINARY_CLOUD_NAME`    | Yes      | Cloudinary cloud name                                  |
| `CLOUDINARY_API_KEY`       | Yes      | Cloudinary API key                                     |
| `CLOUDINARY_API_SECRET`    | Yes      | Cloudinary API secret                                  |

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
pnpm start  # runs dist/server.js
```

## Project Structure

```
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

Each route applies middleware in a deliberate order:

1. **Concurrency** — limits parallel requests per route
2. **Rate limiting** — per-route limiters (parse, application, interview prep) + global fallback
3. **Upload** — multer + magic byte file validation
4. **PDF parsing** — extracts and validates text from uploaded PDFs
5. **Validation** — Zod schema validation against request body
6. **Usage limiter** — deducts AI quota only after all validation passes
7. **Timeout** — LLM timeout protection
8. **Controller** — business logic

## Security

- Helmet for HTTP security headers
- CORS restricted to frontend domain
- CSRF protection via double-submit cookie pattern
- Rate limiting via Upstash Redis (global, per-route, and usage-based)
- MongoDB query filter sanitization via `mongoose.set('sanitizeFilter', true)`
- Input sanitization (HPP, object stripping)
- MongoDB ObjectId validation at request boundaries
- Clerk JWT verification on all protected routes
- Svix signature verification on webhook endpoint
- IPv4 and IPv6 address masking in logs

## AI Usage Limits

LLM calls are metered per user with a weekly quota. The usage limiter runs after all validation middleware so invalid or rejected requests never consume quota. Routes with LLM calls:

- `POST /api/cv` — CV extraction (1 call)
- `POST /api/job` — Job extraction (1 call)
- `POST /api/application` — Match scoring + application generation (3 calls)
- `POST /api/interview/:id` — Interview prep generation (1 call)

## Account Deletion

When a user deletes their account via Clerk, a `user.deleted` webhook fires and automatically:

1. Deletes all Cloudinary PDF assets
2. Deletes all CVs, Applications, and InterviewPreps from MongoDB
3. Deletes the user record

## Deployment

Deployed on [Render](https://render.com).

- **Build command**: `pnpm install && pnpm run build`
- **Start command**: `pnpm start`
- All environment variables are set in the Render dashboard
