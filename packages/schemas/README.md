# @applera/schemas

This package contains shared TypeScript schemas and types used by the frontend and backend apps.

## Purpose

- Share common data models across `apps/client` and `apps/server`
- Keep API contract, validation, and type definitions consistent across the monorepo
- Export reusable Zod schemas for CVs, jobs, applications, interviews, and common status data

## Scripts

Run these commands from `packages/schemas`:

```bash
pnpm build
pnpm typecheck
```

## Usage

Import the shared schemas in other packages:

```ts
import { CVDocumentSchema } from '@applera/schemas';
```

## Development

- Update schema source files in `src/`
- `build` generates the package exports via `tsdown`
- `typecheck` validates TypeScript types without emitting output
