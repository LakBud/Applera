# Applera

An AI-powered job application platform that streamlines the job search process with automated CV parsing, application generation, and interview preparation.

## Overview

Applera is a full-stack TypeScript application designed to help job seekers manage applications efficiently. The platform leverages AI (Groq) to parse CVs, generate tailored applications, and provide interview prep guidance.

## Architecture

The project is organized as a **monorepo** with two main components:

### [`client/`](./client) — Frontend

A modern **React 19 + TypeScript** single-page application built with:

- **Vite** for fast development and optimized builds
- **TanStack Router** for file-based routing
- **TanStack Query** for server state management
- **Clerk** for authentication
- **Tailwind CSS v4** + **shadcn/ui** for styling and components
- **Deployed on Vercel**

### [`server/`](./server) — Backend

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

- **Node.js 18+**
- **pnpm** (or npm/yarn)

### Setup

```bash
# Install dependencies for both client and server
pnpm install --recursive

# Or install individually
cd client && pnpm install
cd server && pnpm install
```

### Environment Setup

Each subdirectory requires a `.env` file. See the respective READMEs for details:

- **Client**: [`client/README.md`](./client/README.md#environment-variables)
- **Server**: [`server/README.md`](./server/README.md#environment-variables)

### Development

In one terminal, start the backend:

```bash
cd server
pnpm dev
```

In another terminal, start the frontend:

```bash
cd client
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5005

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
├── client/              # React frontend (Vite + TanStack Router)
│   ├── src/
│   │   ├── api/         # Axios client and API functions
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── routes/      # File-based routes
│   │   └── hooks/       # Custom React hooks
│   └── package.json
├── server/              # Express backend (REST API)
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # Business logic
│   │   └── server.ts    # App entry point
│   └── package.json
├── .gitignore
└── README.md            # This file
```

## Documentation

- **Frontend**: See [`client/README.md`](./client/README.md) for React setup, routing, and deployment details
- **Backend**: See [`server/README.md`](./server/README.md) for API routes, database setup, and deployment details

## Deployment

### Frontend (Vercel)

- **Build command**: `vite build`
- **Output directory**: `dist`
- **Root directory**: `client`

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

**Questions?** See the individual README files for each component:

- [`client/README.md`](./client/README.md)
- [`server/README.md`](./server/README.md)

---

Copyright (c) 2026 Applera. All rights reserved.
