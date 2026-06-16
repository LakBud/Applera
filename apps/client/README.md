# Applera — Frontend

React + TypeScript frontend for the Applera job application platform.

## Stack

- **Framework**: React 19
- **Routing**: TanStack Router (file-based)
- **Data fetching**: TanStack Query
- **Auth**: Clerk
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **HTTP Client**: Axios
- **Build tool**: Vite

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.20.0

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
├── api/          # Axios client and API functions
├── components/   # Shared UI components
│   ├── common/   # Layout, nav, logo, loaders
│   └── ui/       # shadcn/ui primitives
├── core/         # App bootstrap
│   ├── App.tsx
│   ├── queryClient.ts
│   └── router.ts
├── hooks/        # Custom React hooks
├── lib/          # Utilities (cn, etc.)
├── pages/        # Page components
│   ├── auth/     # Sign in / Sign up
│   ├── application/
│   └── cv/
├── routes/       # TanStack Router file-based routes
├── utils/        # Helper functions
├── declarations.d.ts
├── globals.css   # Global styles
├── main.tsx      # Entry point
└── routeTree.gen.ts  # Auto-generated — do not edit
```

## Routing

Routes are file-based via TanStack Router. `routeTree.gen.ts` is auto-generated on dev/build — do not edit it manually.

Protected routes live under `routes/__protected/` and redirect unauthenticated users to sign-up.

## Deployment

Deployed on [Vercel](https://vercel.com).

- **Build command**: `vite build`
- **Output directory**: `dist`
- **Root directory**: `apps/client`

Environment variables are set in the Vercel dashboard.
