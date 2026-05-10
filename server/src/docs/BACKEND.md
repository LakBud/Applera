# Backend Documentation

Complete reference for the job application generator backend.

---

## Stack

| Layer       | Technology               |
| ----------- | ------------------------ |
| Runtime     | Node.js (ESM)            |
| Framework   | Express                  |
| Database    | MongoDB via Mongoose     |
| AI Provider | OpenAI or Ollama (local) |
| PDF Parsing | pdf-parse                |
| Validation  | Zod                      |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the backend root:

```env
# Required
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
OPENAI_API_KEY=sk-...
API_KEY=any-long-random-string

# Optional — these have defaults
PORT=5005
NODE_ENV=development
CLIENT_URL=http://localhost:5173
OPENAI_MODEL=gpt-4o-mini

# Ollama (local AI) — set these instead of OPENAI_API_KEY
# AI_PROVIDER=ollama
# OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
# OLLAMA_MODEL=llama3.2:3b
```

The server **refuses to start** if `MONGO_URI`, `OPENAI_API_KEY` (when not using Ollama), or `API_KEY` are missing.

### 3. Start the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 4. Verify

```bash
curl http://localhost:5005/health
# → { "status": "ok" }
```

---

## Environment Variables

| Variable          | Required           | Default                     | Description                               |
| ----------------- | ------------------ | --------------------------- | ----------------------------------------- |
| `MONGO_URI`       | ✅                 | —                           | MongoDB connection string                 |
| `OPENAI_API_KEY`  | ✅ (unless Ollama) | —                           | OpenAI API key                            |
| `API_KEY`         | ✅                 | —                           | Bearer token for all `/api` routes        |
| `PORT`            | ❌                 | `5005`                      | Port the server listens on                |
| `NODE_ENV`        | ❌                 | `development`               | Set to `production` to hide error details |
| `CLIENT_URL`      | ❌                 | `http://localhost:5173`     | Allowed CORS origin                       |
| `OPENAI_MODEL`    | ❌                 | `gpt-4o-mini`               | OpenAI model to use                       |
| `AI_PROVIDER`     | ❌                 | `openai`                    | Set to `ollama` to use a local model      |
| `OLLAMA_BASE_URL` | ❌                 | `http://127.0.0.1:11434/v1` | Ollama server URL                         |
| `OLLAMA_MODEL`    | ❌                 | `llama3.2:3b`               | Ollama model to use                       |

---

## Folder Structure

```
src/
├── config/
│   └── env.js                  # Validates and exports all env vars
├── db/
│   └── db.js                   # MongoDB connection
├── lib/
│   ├── aiClient.js             # OpenAI/Ollama client singleton
│   ├── llm.js                  # Shared LLM call wrapper with retry logic
│   ├── parseModelJson.js       # Robust JSON extractor for LLM output
│   └── pdfParser.js            # PDF text extraction
├── middleware/
│   ├── rateLimiter.js          # Tiered rate limits per route
│   ├── sanitize.js             # NoSQL injection + HTTP param pollution
│   ├── timeout.js              # Per-route request timeouts
│   ├── upload.js               # Multer config + magic byte PDF validation
│   ├── parsePdf.js             # Extracts text from uploaded PDF buffer
│   └── validate.js             # Zod request body validation
├── models/
│   ├── CV.js                   # Mongoose CV schema
│   ├── Job.js                  # Mongoose Job schema
│   └── Application.js          # Mongoose Application schema
├── prompts/
│   ├── extractCVPrompt.js      # System prompt for CV parsing
│   ├── extractJobPrompt.js     # System prompt for job parsing
│   └── applicationGenPrompt.js # System prompt for application generation
├── routes/
│   ├── cv.routes.js            # POST /api/cv/upload
│   ├── job.routes.js           # POST /api/job/analyze
│   └── application.routes.js  # POST /api/application/create
├── services/
│   ├── extractors.js           # extractCVData, extractJobData
│   ├── matchService.js         # matchCVToJob (local, no LLM)
│   ├── applicationService.js   # generateApplication
│   └── pipeline.js             # Full end-to-end orchestrator
├── utils/
│   └── matchUtils.js           # Pure matching/scoring utility functions
└── server.js                   # Express entry point
```

---

## API Reference

All routes require:

```
Authorization: Bearer <API_KEY>
Content-Type: application/json  (or multipart/form-data for PDF uploads)
```

---

### `POST /api/cv/upload`

Parses a CV and returns structured data.

**Accepts:** PDF file upload or plain text.

**PDF upload (multipart/form-data)**

```
Field name: cv
File type:  PDF only, max 5 MB
```

**Plain text (application/json)**

```json
{
  "cvText": "My name is Alex Johnson..."
}
```

**Response**

```json
{
  "message": "CV parsed successfully.",
  "rawText": "My name is Alex Johnson...",
  "structured": {
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "phone": "+47 123 45 678",
    "github": "github.com/alexj",
    "summary": "Full Stack Developer with 4 years experience...",
    "seniority_level": "Mid-level",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "experience": [
      {
        "title": "Full Stack Developer",
        "company": "TechNova",
        "highlights": ["Led frontend migration from JavaScript to TypeScript"]
      }
    ],
    "education": [
      {
        "title": "Bachelor's degree in Computer Science",
        "school": "University of Oslo"
      }
    ]
  }
}
```

---

### `POST /api/job/analyze`

Parses a job listing and returns structured data.

**Accepts:** PDF file upload or plain text.

**PDF upload (multipart/form-data)**

```
Field name: job
File type:  PDF only, max 5 MB
```

**Plain text (application/json)**

```json
{
  "jobText": "We are looking for a Senior Backend Developer..."
}
```

**Response**

```json
{
  "message": "Job parsed successfully.",
  "rawText": "We are looking for a Senior Backend Developer...",
  "structured": {
    "title": "Senior Backend Developer",
    "required_skills": ["Node.js", "TypeScript", "Express", "PostgreSQL"],
    "responsibilities": ["Building scalable backend systems", "Collaborating across teams"],
    "seniority": "senior"
  }
}
```

---

### `POST /api/application/create`

Runs the full pipeline and returns a saved job application.

**Body (application/json)**

```json
{
  "cvText": "My name is Alex Johnson...",
  "jobText": "We are looking for a Senior Backend Developer..."
}
```

**Response**

```json
{
  "application": {
    "_id": "...",
    "cv": "cv_document_id",
    "job": "job_document_id",
    "match": {
      "score": 72,
      "confidence": "high",
      "strengths": ["nodejs", "typescript", "express"],
      "missing_skills": ["cicdpipelines"]
    },
    "tailored_cv_summary": "Erfaren fullstackutvikler med solid kompetanse...",
    "cover_letter": "Jeg søker stillingen som Senior Backend Developer...",
    "application_email": {
      "subject": "Søknad til Senior Backend Developer",
      "body": "Hei, jeg ønsker å søke på stillingen..."
    },
    "createdAt": "2026-05-10T11:36:32.308Z",
    "updatedAt": "2026-05-10T11:36:32.308Z"
  },
  "cv": { ... },
  "job": { ... }
}
```

**Pipeline steps (what runs internally)**

```
1. extractCVData(cvText)    → structured CV    (1 LLM call)
2. extractJobData(jobText)  → structured job   (1 LLM call)
3. matchCVToJob(cv, job)    → match report     (local, no LLM)
4. generateApplication(...) → cover letter etc (1 LLM call)
5. Save CV, Job, Application to MongoDB
6. Return all three documents
```

---

### `GET /health`

Public route — no auth required.

```json
{ "status": "ok" }
```

---

## Error Responses

All errors follow the same shape:

```json
{ "error": "Human-readable error message." }
```

| Status | Cause                                                                        |
| ------ | ---------------------------------------------------------------------------- |
| `400`  | Invalid input (missing fields, wrong type, text too short/long, invalid PDF) |
| `401`  | Missing or incorrect `Authorization` header                                  |
| `429`  | Rate limit exceeded                                                          |
| `500`  | Server error (message hidden in production)                                  |
| `503`  | Request timed out (AI call took longer than 90s)                             |

---

## Rate Limits

| Route                          | Limit        | Window         |
| ------------------------------ | ------------ | -------------- |
| `POST /api/application/create` | 10 requests  | per 15 minutes |
| `POST /api/cv/upload`          | 20 requests  | per 10 minutes |
| `POST /api/job/analyze`        | 20 requests  | per 10 minutes |
| All routes (global)            | 100 requests | per 15 minutes |

Exceeded limits return `429` with a message explaining how long to wait.

---

## Security

| Feature              | Implementation                                           |
| -------------------- | -------------------------------------------------------- |
| Authentication       | Bearer token on all `/api` routes                        |
| Security headers     | `helmet` (XSS, clickjacking, MIME sniffing)              |
| CORS                 | Whitelist-only origin + method restriction               |
| Body size limit      | 50 KB max on JSON bodies                                 |
| Rate limiting        | Tiered per-route + global                                |
| NoSQL injection      | `$`-key stripping on `req.body` and `req.params`         |
| HTTP param pollution | `hpp` middleware                                         |
| PDF MIME spoofing    | Magic byte validation (`%PDF` header check)              |
| Schema validation    | Zod on all request bodies                                |
| Request timeout      | 90s hard limit on AI routes                              |
| Prompt injection     | Pattern detection before LLM calls                       |
| PII logging          | LLM output truncated to 300 chars in dev, silent in prod |
| Error leakage        | Raw error messages hidden in production                  |
| Proxy IP             | `trust proxy` enabled in production                      |

---

## AI Provider

### OpenAI (default)

Set `OPENAI_API_KEY` in `.env`. Model defaults to `gpt-4o-mini`.

Token limits per call:

- CV extraction: 2000 tokens
- Job extraction: 2000 tokens
- Application generation: 4000 tokens

### Ollama (local, free)

```bash
# Install from https://ollama.com, then:
ollama pull llama3.2:3b
ollama serve
```

```env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:3b
```

> **Note:** Local models produce significantly lower quality Norwegian application text than GPT-4o-mini. Use Ollama for development and testing only.

### Retry logic

All LLM calls retry up to 2 times with exponential backoff (500ms, 1000ms) on failure before throwing.

---

## Data Models

### CV

```js
{
  rawText: String,
  parsed: {
    name, email, phone, github, summary,
    seniority_level,
    skills: [String],
    experience: [{ title, company, highlights: [String] }],
    education:  [{ title, school }]
  }
}
```

### Job

```js
{
  rawText: String,
  parsed: {
    title,
    required_skills:  [String],
    responsibilities: [String],
    seniority
  },
  company: String,
  location: String
}
```

### Application

```js
{
  cv:  ObjectId → CV,
  job: ObjectId → Job,
  match: {
    score:          Number,   // 0–100
    confidence:     String,   // "high" | "medium" | "low"
    strengths:      [String], // normalized skill names
    missing_skills: [String]
  },
  tailored_cv_summary: String,
  cover_letter:        String,
  application_email: {
    subject: String,
    body:    String
  }
}
```

---

## Match Scoring

Matching is done **locally** — no LLM call, instant result.

**Score formula**

```
score = (skill_overlap * 0.6) + (text_overlap * 0.4)
```

- `skill_overlap` — percentage of required job skills found in the CV
- `text_overlap` — percentage of job description words found in CV text

**Confidence levels**

| Confidence | Meaning                                            |
| ---------- | -------------------------------------------------- |
| `high`     | Enough data to trust the score                     |
| `medium`   | Limited skills data — score may be inaccurate      |
| `low`      | Very little data — treat score as a rough estimate |

**Recommendation thresholds**

| Score  | Recommendation                    |
| ------ | --------------------------------- |
| 80–100 | Strong match — apply immediately  |
| 60–79  | Good match — consider applying    |
| 40–59  | Moderate match — improve CV first |
| 0–39   | Weak match — not recommended      |

---

## Testing with Postman

1. Set `Authorization` header on the collection: `Bearer <your API_KEY>`
2. Test in order:

```
GET  /health                        # confirm server is running
POST /api/cv/upload                 # paste a short CV as { "cvText": "..." }
POST /api/job/analyze               # paste a job listing as { "jobText": "..." }
POST /api/application/create        # both fields together
```

To test PDF upload: Body → form-data → key `cv` or `job`, type `File`.

To confirm auth is working, send a request without the header — expect `401`.
