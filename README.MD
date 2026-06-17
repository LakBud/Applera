# Applera

An AI-powered job application platform that streamlines the job search process with automated CV parsing, application generation, and interview preparation.

## Overview

Applera is a full-stack TypeScript monorepo designed to help job seekers manage applications efficiently. The platform leverages AI (Groq) to parse CVs, generate tailored applications, and provide interview prep guidance.

## Architecture

The project is organized as a **pnpm workspace monorepo** with two apps:

### [`apps/client/`](apps/client) — Frontend

A modern **React 19 + TypeScript** single-page application built with:

- **Vite** for fast development and optimized builds
- **TanStack Router** for file-based routing
- **TanStack Query** for server state management
- **Clerk** for authentication
- **Tailwind CSS v4** + **shadcn/ui** for styling and components
- **Axios** with modularised request/response interceptors
- **Deployed on Vercel**

### [`apps/server/`](apps/server) — Backend

A **Node.js + Express** REST API built with:

- **Express 5** for HTTP handling
- **MongoDB + Mongoose** for data persistence
- **Clerk** for authentication (JWT verification)
- **Groq API** (llama-3.3-70b-versatile) for AI-powered features
- **Cloudinary** for PDF file storage
- **Upstash Redis** for caching and rate limiting
- **Deployed on Render**

## Quick Start

### Prerequisites

- **Node.js 20+**
- **pnpm 10.20.0** (`npm install -g pnpm@10.20.0`)

### Setup

```bash
pnpm install
```

### Environment Setup

Each app requires its own `.env` file. See the respective READMEs for details:

- **Client**: [`apps/client/README.md`](./apps/client/README.md#environment-variables)
- **Server**: [`apps/server/README.md`](./apps/server/README.md#environment-variables)

### Development

```bash
# Start both client and server concurrently
pnpm dev

# Or start individually
pnpm dev:client   # http://localhost:5173
pnpm dev:server   # http://localhost:5005
```

### Docker

```bash
# Development
pnpm dev:docker

# Production
pnpm docker:prod
```

## Key Features

### CV Management

Upload and parse resumes via AI, extract structured data (skills, experience, education), and store PDFs securely on Cloudinary.

### Job Applications

Auto-generate tailored cover letters and applications with AI-powered content generation via Groq. Track application status across multiple roles.

### Interview Preparation

Generate personalised interview prep guides and questions based on your CV and job description.

### Application Tracking

Monitor application status, view dashboard insights, and visualise job search progress.

## Security

- Helmet for HTTP security headers
- CORS restricted to frontend domain
- CSRF protection via double-submit cookie pattern with in-flight deduplication
- MongoDB query filter sanitization via `mongoose.set('sanitizeFilter', true)`
- MongoDB ObjectId validation at request boundaries
- Input validation and sanitization (Zod, HPP, object stripping)
- Clerk JWT verification on all protected routes
- Svix signature verification on webhook endpoint
- Per-route and global rate limiting via Upstash Redis
- Usage-based AI quota limiting — quota only charged after validation passes
- IPv4 and IPv6 address masking in logs

## Project Structure

```
.
├── apps/
│   ├── client/
│   │   └── src/
│   │       ├── api/
│   │       │   ├── application/
│   │       │   ├── cv/
│   │       │   ├── interview/
│   │       │   ├── job/
│   │       │   ├── interceptors/
│   │       │   ├── client.ts
│   │       │   ├── queryKeys.ts
│   │       │   └── types.ts
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── pages/
│   │       ├── routes/
│   │       └── utils/
│   └── server/
│       └── src/
│           ├── config/
│           ├── controllers/
│           ├── lib/
│           ├── middleware/
│           │   ├── auth/
│           │   ├── pdf/
│           │   ├── rate/
│           │   ├── request/
│           │   └── upload/
│           ├── models/
│           ├── prompts/
│           ├── routes/
│           ├── services/
│           │   ├── application/
│           │   ├── audit/
│           │   ├── match/
│           │   └── pipeline/
│           ├── types/
│           ├── utils/
│           ├── workers/
│           └── server.ts
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

## Tech Stack

| Category         | Technology                                        |
| ---------------- | ------------------------------------------------- |
| **Frontend**     | React 19, TypeScript, Vite, TanStack Router/Query |
| **Backend**      | Node.js, Express 5, TypeScript                    |
| **Database**     | MongoDB Atlas + Mongoose                          |
| **Auth**         | Clerk (JWT-based)                                 |
| **AI**           | Groq (llama-3.3-70b-versatile)                    |
| **File Storage** | Cloudinary                                        |
| **Cache**        | Upstash Redis                                     |
| **Styling**      | Tailwind CSS v4, shadcn/ui                        |
| **Validation**   | Zod                                               |

## Documentation

- **Frontend**: [`apps/client/README.md`](./apps/client/README.md)
- **Backend**: [`apps/server/README.md`](./apps/server/README.md)

## Deployment

### Frontend — Vercel

- **Build command**: `vite build`
- **Output directory**: `dist`
- **Root directory**: `apps/client`

### Backend — Render

- **Build command**: `pnpm install && pnpm run build`
- **Start command**: `pnpm start`

---

Copyright (c) 2026 Applera. All rights reserved.
