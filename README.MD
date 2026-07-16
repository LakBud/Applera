<p align="center">
  <img src="apps/client/public/images/og-header.jpg" alt="Applera logo" width="120">
</p>


<p align="center">
  AI-powered job application platform that streamlines your job search with CV & Application Management, tailored application generation with CV advice and interview preparation.
</p>

---

<p align="center">
  <img src="apps/client/public/videos/applera-preview.gif" alt="Applera demo: upload a CV and job posting, then generate a tailored application" width="720">
</p>

<p align="center">
  <em>Primary user flow: CV + job → generate application</em>
</p>

---



## Overview

This repository is a **TypeScript monorepo** powered by **pnpm** and **Turborepo**. It contains a React frontend, an Express backend, and shared schema packages for consistent types across the stack.

## Why I built it

I wanted an easier way to tailor applications to each job instead of manually rewriting my cover letter every time

## Architecture

The project is organized as a **pnpm workspace monorepo** with two main apps and one shared package:

- `apps/client/` — Frontend web app
- `apps/server/` — Backend REST API
- `packages/schemas/` — Shared TypeScript schemas and type definitions

### [`apps/client/`](apps/client) — Frontend

A modern **React 19 + TypeScript** single-page application built with:

- **Vite** for fast development and optimized builds
- **TanStack Router** for file-based routing
- **TanStack Query** for server state management
- **Clerk** for authentication
- **Tailwind CSS v4** + **shadcn/ui** for styling and UI components
- **Axios** with modular request/response interceptors

### [`apps/server/`](apps/server) — Backend

A **Node.js + Express 5** REST API built with:

- **Express 5** for HTTP handling
- **MongoDB + Mongoose** for persistence
- **Clerk** for auth and webhook handling
- **Groq** for AI-powered CV parsing, application generation, and interview prep
- **Cloudinary** for PDF storage
- **Upstash Redis** for caching and rate limiting

## Userflow
```
   ┌──────────────────────────┐    ┌────────────────┐   ┌───────────────┐
   │       CV Dashboard       │ <- │   CV upload    │ + │  Job upload   │
   │ GET /api/dashboard/:cvId │    │  POST /api/cv  │   │ POST /api/job │
   └──────-───────────────────┘    └───────┬────────┘   └──────┬────────┘
               ^                           │                   │
               │                           │                   │
               │                           ▼                   ▼
               │                      ┌──────────────────────────────┐
               │                      │ Generate application         │
               │                      │ POST /api/application        │
               │                      └──────────────────────────────┘
               │                                     │
               │                                     ▼
               │                      ┌──────────────────────────────┐
               │                      │ Application result           │
               └──────────────────────│ GET /api/application         │ 
                                      └──────────────────────────────┘
                                                    │
                                                    ▼
                                      ┌──────────────────────────────┐
                                      │ Interview prep               │
                                      │ POST /api/interview/:id      │
                                      └──────────────────────────────┘
```

- The frontend collects a CV and a job listing on the homepage generator.
- `POST /api/cv` uploads the CV and creates a dashboard at `GET /api/dashboard/:cvId`.
- `POST /api/job` uploads the job listing and stores it alongside the CV data.
- `POST /api/application` generates a tailored job application from the saved CV and job details which feeds into `GET /api/dashboard/:cvId`.
- `GET /api/application` returns the generated application result.
- `POST /api/interview/:id` generates interview prep for the saved application.

## Quick Start

### Prerequisites

- **Node.js 20+**
- **pnpm 11.8.0** (`npm install -g pnpm@11.8.0`)

### Install dependencies

```bash
pnpm install
```

### Environment setup

Each app has its own environment configuration. See the app READMEs for details:

- **Client**: [`apps/client/README.md`](./apps/client/README.md#environment-variables)
- **Server**: [`apps/server/README.md`](./apps/server/README.md#environment-variables)

### Development

```bash
# Start both client and server concurrently
pnpm dev

# Start only the client
pnpm dev:client

# Start only the server
pnpm dev:server
```

- Client: `http://localhost:5173`
- Server: `http://localhost:5005`

### Docker

```bash
# Development
pnpm dev:docker

# Production
pnpm docker:prod
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Start both apps in development |
| `pnpm dev:client` | Start the frontend |
| `pnpm dev:server` | Start the backend |
| `pnpm dev:docker` | Run development Docker compose |
| `pnpm build` | Build both apps |
| `pnpm build:client` | Build frontend only |
| `pnpm build:server` | Build backend only |
| `pnpm start:server:dev` | Start development backend from build output |
| `pnpm start:server:prod` | Start production backend from build output |
| `pnpm docker:prod` | Run production Docker compose |
| `pnpm lint` | Run workspace lint rules |
| `pnpm lint:fix` | Fix lint issues |
| `pnpm typecheck` | Run workspace type checks |
| `pnpm format` | Format code |
| `pnpm format:check` | Check formatting without writing |
| `pnpm test` | Run workspace tests |
| `pnpm test:unit` | Run all unit tests |
| `pnpm test:integration` | Run all integration tests |
| `pnpm test:coverage` | Run test coverage |
| `pnpm test:server` | Test backend only |
| `pnpm test:server:unit` | Run backend unit tests |
| `pnpm test:server:integration` | Run backend integration tests |
| `pnpm test:client` | Test frontend only |
| `pnpm test:client:unit` | Run frontend unit tests |
| `pnpm test:client:integration` | Run frontend integration tests |
| `pnpm prepare` | Install Git hooks via Husky |


## Key Features

- AI-powered CV ingestion and parsing
- Tailored application and cover letter generation
- Interview preparation with custom question guides
- Application tracking and status dashboards
- Secure PDF storage and user account lifecycle cleanup
- Centralised shared schemas for frontend/backend consistency

## Security highlights

- Helmet for HTTP security headers
- CORS restricted to frontend domain
- CSRF protection using double-submit cookie pattern
- Rate limiting via Upstash Redis
- Input validation and sanitization with Zod and HPP
- MongoDB query sanitization via `mongoose.set('sanitizeFilter', true)`
- Clerk JWT authentication on protected routes
- Svix signature verification for webhook events
- Per-route rate limiting on AI-backed endpoints

## Repository structure

```
Applera
├── apps/
│   ├── client/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   ├── server/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
├── packages/
│   └── schemas/
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
|       └── README.md
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
├── turbo.json
```



## Tech stack

| Category         | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Frontend         | React 19, TypeScript, Vite, TanStack Router, TanStack Query |
| Backend          | Node.js, Express 5, TypeScript                    |
| Database         | MongoDB Atlas, Mongoose                           |
| Auth             | Clerk                                             |
| AI               | Groq                                              |
| Storage          | Cloudinary                                        |
| Cache / rate limit | Upstash Redis                                  |
| Styling          | Tailwind CSS v4, shadcn/ui                        |
| Validation       | Zod                                               |

## Documentation

- Frontend docs: [`apps/client/README.md`](./apps/client/README.md)
- Backend docs: [`apps/server/README.md`](./apps/server/README.md)

## Deployment

### Frontend — Cloudflare Pages

- Root directory: `apps/client`
- Build command: `pnpm build:client`
- Output directory: `dist/apps/client`

### Backend — Render

- Build command: `pnpm install && pnpm build:server`
- Start command: `pnpm start:server:prod`

## Contributing

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request.

## License

Copyright (c) 2026 Applera. All rights reserved.

This software is licensed under the PolyForm Noncommercial License 1.0.0.
Personal and noncommercial use is permitted free of charge.
Commercial use requires a separate paid license.

Full license terms: [`LICENSE`](./LICENSE)

