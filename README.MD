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
- **Deployed on Vercel**

### [`apps/server/`](apps/server) — Backend

A **Node.js + Express** REST API built with:

- **Express 5** for HTTP handling
- **MongoDB + Mongoose** for data persistence
- **Clerk** for authentication (JWT verification)
- **Groq API** (llama-3.3-70b-versatile) for AI-powered features
- **Cloudinary** for PDF file storage
- **Upstash Redis** for rate limiting
- **Deployed on Render**

## Quick Start

### Prerequisites

- **Node.js 20+**
- **pnpm 10.20.0** (`npm install -g pnpm@10.20.0`)

### Setup

```bash
# Install all dependencies from the root
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

### CV Management (`/api/cv`)

- Upload and parse resumes via AI
- Extract structured data (skills, experience, education)
- Store PDFs securely on Cloudinary

### Job Applications (`/api/application`)

- Auto-generate tailored cover letters and applications
- Track application status across multiple job boards
- AI-powered content generation via Groq

### Interview Preparation (`/api/interview`)

- Generate personalized interview prep guides
- Question generation based on CV and job description
- Mock interview resources

### Application Tracking (`/api/tracker`)

- Monitor application status
- Dashboard insights and analytics
- Visualize job search progress

### Security

- Helmet for HTTP security headers
- CORS restricted to frontend domain
- CSRF protection via double-submit cookie pattern
- Input validation and sanitization
- Clerk JWT verification on protected routes
- Rate limiting via Upstash Redis

## Project Structure

```
.
├── apps/
│   ├── client/              # React frontend (Vite + TanStack Router)
│   │   ├── src/
│   │   │   ├── api/         # Axios client and API functions
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── routes/      # File-based routes
│   │   │   └── hooks/       # Custom React hooks
│   │   └── package.json
│   │
│   └── server/              # Express backend (REST API)
│       ├── src/
│       │   ├── routes/      # API route handlers
│       │   ├── models/      # Mongoose schemas
│       │   ├── middleware/  # Express middleware
│       │   ├── services/    # Business logic
│       │   └── server.ts    # App entry point
│       └── package.json
│
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── pnpm-workspace.yaml      # Workspace config
├── package.json             # Root workspace config
├── tsconfig.json            # Root TS config
└── README.md
```

## Documentation

- **Frontend**: See [`apps/client/README.md`](./apps/client/README.md) for React setup, routing, and deployment details
- **Backend**: See [`apps/server/README.md`](./apps/server/README.md) for API routes, database setup, and deployment details

## Deployment

### Frontend (Vercel)

- **Build command**: `vite build`
- **Output directory**: `dist`
- **Root directory**: `apps/client`
- **Environment variables**: Set in Vercel

### Backend (Render)

- **Build command**: `pnpm install && pnpm run build`
- **Start command**: `pnpm start`
- **Environment variables**: Set in Render dashboard

## Tech Stack Summary

| Category               | Technology                                        |
| ---------------------- | ------------------------------------------------- |
| **Frontend**           | React 19, TypeScript, Vite, TanStack Router/Query |
| **Backend**            | Node.js, Express 5, TypeScript                    |
| **Database**           | MongoDB (Atlas)                                   |
| **Auth**               | Clerk (JWT-based)                                 |
| **AI/ML**              | Groq (llama-3.3-70b-versatile)                    |
| **File Storage**       | Cloudinary                                        |
| **Caching/Rate Limit** | Upstash Redis                                     |
| **Styling**            | Tailwind CSS v4, shadcn/ui                        |
| **Validation**         | Zod                                               |

---

**Questions?** See the individual README files for each app:

- [`apps/client/README.md`](./apps/client/README.md)
- [`apps/server/README.md`](./apps/server/README.md)

---

Copyright (c) 2026 Applera. All rights reserved.
