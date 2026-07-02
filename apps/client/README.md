# Applera — Frontend

React + TypeScript frontend for the Applera job application platform.

## Stack

- **Framework**: React 19
- **Routing**: TanStack Router (file-based)
- **Data fetching**: TanStack Query
- **Auth**: Clerk
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **HTTP Client**: Axios (modularised interceptors)
- **Build tool**: Vite

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm@11.8.0

### Installation

From the repo root:

```bash
pnpm install
```

Or from this directory:

```bash
cd apps/client
pnpm install
```

### Environment Variables

Create a `.env.development` or `.env.production` file in `apps/client/` (see `.env.example`):

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://api.applera.site
```

| Variable                     | Required | Description           |
| ---------------------------- | -------- | --------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key |
| `VITE_API_URL`               | Yes      | Backend API base URL  |

Only `VITE_` prefixed variables are exposed to the browser.

### Development

From the repo root:

```bash
pnpm dev:client
```

Or from this directory:

```bash
pnpm dev
```

Starts the dev server on `http://localhost:5173`.

### Production Build

```bash
pnpm build
```

Outputs to `dist/`.

## Project Structure

```
src/
├── api/
│ ├── application/
│ ├── cv/
│ ├── interview/
│ ├── job/
│ ├── interceptors/
│ ├── client.ts
│ ├── queryKeys.ts
│ └── types.ts
├── components/
│ ├── common/
│ └── ui/
├── core/
│ ├── App.tsx
│ ├── queryClient.ts
│ └── router.ts
├── hooks/
├── lib/
├── pages/
│ ├── auth/
│ ├── application/
│ └── cv/
├── routes/
├── utils/
├── declarations.d.ts
├── globals.css
├── main.tsx
└── routeTree.gen.ts
```

## API Layer

Each domain has three files:

- `*.api.ts` — raw API functions (fetch, parse, return typed data)
- `*.hooks.ts` — TanStack Query hooks (useQuery, useMutation)
- `*.schemas.ts` — Zod schemas and inferred TypeScript types

Hooks delegate to API functions — no inline fetch logic in hooks.

## HTTP Client

The Axios client (`api/client.ts`) uses two interceptors:

- **Request** (`interceptors/request.interceptor.ts`) — attaches Bearer token and CSRF token with in-flight deduplication to prevent parallel token races
- **Response** (`interceptors/response.interceptor.ts`) — normalises all errors to a typed `ClientError` shape with codes: `TIMEOUT`, `NETWORK_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`, `USAGE_LIMIT_REACHED`, `UNKNOWN`

## Routing

Routes are file-based via TanStack Router. `routeTree.gen.ts` is auto-generated on dev/build — do not edit it manually.

Protected routes live under `routes/__protected/` and redirect unauthenticated users to sign-up.

## Deployment

Deployed on [Vercel](https://vercel.com).

- **Build command**: `vite build`
- **Output directory**: `dist`
- **Root directory**: `apps/client`

Environment variables are set in the Vercel dashboard.
