# Applera — Backend

Express + TypeScript REST API powering the Applera job application platform.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose
- **Auth**: Clerk
- **AI**: Groq (llama-3.3-70b-versatile)
- **File storage**: Cloudinary
- **Rate limiting**: Upstash Redis
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
├── config/       # App configuration and env validation
├── controllers/  # Route handler logic
├── db/           # MongoDB connection
├── integrations/ # Third-party service clients (Groq, Cloudinary, Redis)
├── lib/          # Internal utilities and helpers
├── middleware/   # Express middleware (auth, CSRF, rate limiting, etc.)
├── models/       # Mongoose schemas and models
├── prompts/      # AI prompt templates
├── routes/       # Express route definitions
├── services/     # Business logic
├── types/        # Shared TypeScript types
├── utils/        # General utility functions
├── workers/      # Background tasks
└── server.ts     # App entry point
```

## API Routes

| Method | Path                  | Description                         |
| ------ | --------------------- | ----------------------------------- |
| GET    | `/health`             | Health check                        |
| POST   | `/api/webhooks/clerk` | Clerk webhook handler               |
| `*`    | `/api/cv`             | CV upload, parsing, management      |
| `*`    | `/api/job`            | Job listing management              |
| `*`    | `/api/application`    | Application generation and tracking |
| `*`    | `/api/interview`      | Interview prep generation           |
| `*`    | `/api/tracker`        | Application status tracker          |
| `*`    | `/api/dashboard`      | Dashboard stats                     |

## Security

- Helmet for HTTP security headers
- CORS restricted to frontend domain
- CSRF protection via double-submit cookie pattern
- Rate limiting via Upstash Redis
- Input sanitization (HPP, object stripping)
- Clerk JWT verification on all protected routes
- Svix signature verification on webhook endpoint

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
