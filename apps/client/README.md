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

- Node.js 18+
- pnpm

### Installation

```bash
cd client
pnpm install
```

### Environment Variables

Create a `.env` file in the `client/` directory:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://api.applera.site
```

| Variable                     | Required | Description           |
| ---------------------------- | -------- | --------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key |
| `VITE_API_URL`               | Yes      | Backend API base URL  |

### Development

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
├── pages/        # Page components
│   ├── auth/     # Sign in / Sign up
│   ├── application/
│   └── cv/
├── routes/       # TanStack Router file-based routes
├── hooks/        # Custom React hooks
├── lib/          # Utilities (cn, etc.)
└── globals.css   # Global styles
```

## Routing

Routes are file-based via TanStack Router. The `routeTree.gen.ts` file is auto-generated — do not edit it manually.

Protected routes live under `routes/__protected/` and redirect unauthenticated users to sign-up.

## Deployment

Deployed on [Vercel](https://vercel.com).

- **Build command**: `vite build`
- **Output directory**: `dist`
- **Root directory**: `client`

Environment variables are set in the Vercel dashboard. Only `VITE_` prefixed variables are exposed to the browser.
