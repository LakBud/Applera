# Security Policy

## Supported Versions

Only the latest version deployed on `main` is actively maintained and receives security fixes.

## Reporting a Vulnerability

If you discover a security vulnerability in Applera, please **do not** open a public GitHub issue.

Instead, report it privately via:

- GitHub's private vulnerability reporting (Security tab → "Report a vulnerability"), or
- Email: [LBud@tuta.io] (The owners email)

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept if possible)
- Any relevant logs, screenshots, or affected endpoints

Il try to acknowledge reports within 48–72 hours if possible.

## Scope

**In scope:**

- `apps/client` — frontend application
- `apps/server` — backend API
- Authentication, authorization, and session handling
- File upload / PDF parsing pipeline
- Rate limiting and quota enforcement bypasses

**Out of scope:**

- Vulnerabilities in third-party services we depend on (Clerk, Cloudinary, Groq, MongoDB Atlas, Upstash Redis) — please report those directly to the respective vendor
- Issues requiring physical access to a user's device
- Social engineering attacks against maintainers or users
- Denial of service via brute-force volume alone (rate limiting is already in place, but confirmed bypasses are welcome)

## Current Security Measures

For transparency, Applera currently implements:

- Helmet for HTTP security headers
- CORS restricted to the frontend origin
- CSRF protection via double-submit cookie pattern
- Rate limiting (global, per-route, and usage-based) via Upstash Redis
- Input validation and sanitization with Zod and HPP
- MongoDB query sanitization (`mongoose.set('sanitizeFilter', true)`)
- ObjectId validation at request boundaries
- Clerk JWT verification on all protected routes
- Svix signature verification on webhook endpoints
- Magic-byte file validation on uploads (not just extension/MIME trust)
- IPv4/IPv6 masking in logs

## Disclosure Policy

I ask that you give us a reasonable amount of time to investigate and patch a reported issue before any public disclosure. I am happy to credit reporters (with permission) once a fix is released :)
