# API Documentation

Complete reference for the job application generator API layer (`src/api/`).

---

## Setup

### Environment variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5005
VITE_API_KEY=your-api-key-here
```

`VITE_API_KEY` must match the `API_KEY` value in the backend `.env`.

### QueryClient

Wrap your app with `QueryClientProvider` before using any hooks:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

### Imports

Always import from `@/api` — never from individual files:

```ts
import { useCreateApplication, useUploadCVFile, useAnalyzeJobText } from "@/api";
```

---

## Hooks

All hooks use TanStack Query mutations. They do not fetch on mount — they fire when you call `mutate()` or `mutateAsync()`.

Every hook returns the same shape:

| Property      | Type                    | Description                     |
| ------------- | ----------------------- | ------------------------------- |
| `mutate`      | `(input) => void`       | Fire and forget                 |
| `mutateAsync` | `(input) => Promise<T>` | Await the result                |
| `isPending`   | `boolean`               | True while request is in flight |
| `data`        | `T \| undefined`        | Response data on success        |
| `error`       | `Error \| null`         | Error on failure                |
| `reset`       | `() => void`            | Clears data and error           |

---

### `useCreateApplication`

The main end-to-end hook. Sends CV text and job text, runs the full pipeline (parse → match → generate), and returns the saved application.

**Expect 10–30 seconds** — three LLM calls run internally.

```ts
import { useCreateApplication } from "@/api";

const { mutate, isPending, data, error } = useCreateApplication();

mutate({ cvText: "John Doe, Software Engineer...", jobText: "We are looking for..." });
```

**Input**

```ts
{
  cvText: string; // raw CV text, min 50 chars
  jobText: string; // raw job listing text, min 50 chars
}
```

**Response**

```ts
{
  application: {
    _id:                 string;
    cv:                  string;       // CV document ID
    job:                 string;       // Job document ID
    match: {
      score:          number;          // 0–100
      confidence:     "high" | "medium" | "low";
      strengths:      string[];        // skills present in both CV and job
      missing_skills: string[];        // skills in job but not in CV
    };
    tailored_cv_summary: string;       // 3–5 line Norwegian professional summary
    cover_letter:        string;       // full Norwegian cover letter
    application_email: {
      subject: string;
      body:    string;
    };
    createdAt: string;
    updatedAt: string;
  };
  cv:  CVDocument;
  job: JobDocument;
}
```

**Example with loading and error state**

```tsx
function ApplicationForm() {
  const { mutate, isPending, data, error } = useCreateApplication();

  function handleSubmit(cvText: string, jobText: string) {
    mutate({ cvText, jobText });
  }

  if (isPending) return <p>Generating application...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (data) return <p>Score: {data.application.match.score}</p>;

  return <button onClick={() => handleSubmit("...", "...")}>Generate</button>;
}
```

---

### `useUploadCVFile`

Uploads a CV as a PDF file. Returns the extracted plain text and structured CV data.

```ts
import { useUploadCVFile } from "@/api";

const { mutate, isPending, data } = useUploadCVFile();

// Pass a File object from an <input type="file"> element
mutate(file);
```

**Input:** `File` — must be a PDF, max 5 MB.

**Response**

```ts
{
  message:    string;
  rawText:    string;   // extracted plain text from the PDF
  structured: {
    name:            string;
    email:           string;
    phone:           string;
    github:          string;
    summary:         string;
    seniority_level: string;
    skills:          string[];
    experience: {
      title:      string;
      company:    string;
      highlights: string[];
    }[];
    education: {
      title:  string;
      school: string;
    }[];
  };
}
```

**Example**

```tsx
function CVUpload() {
  const { mutate, isPending, data } = useUploadCVFile();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) mutate(file);
  }

  return (
    <>
      <input type="file" accept=".pdf" onChange={handleChange} />
      {isPending && <p>Parsing CV...</p>}
      {data && <p>Found {data.structured.skills.length} skills</p>}
    </>
  );
}
```

---

### `useUploadCVText`

Uploads a CV as plain text instead of a PDF.

```ts
import { useUploadCVText } from "@/api";

const { mutate, data } = useUploadCVText();

mutate("My name is Alex Johnson, I am a Full Stack Developer...");
```

**Input:** `string` — raw CV text, min 50 characters.

**Response:** same shape as `useUploadCVFile`.

---

### `useAnalyzeJobFile`

Analyzes a job listing uploaded as a PDF.

```ts
import { useAnalyzeJobFile } from "@/api";

const { mutate, isPending, data } = useAnalyzeJobFile();

mutate(file);
```

**Input:** `File` — must be a PDF, max 5 MB.

**Response**

```ts
{
  message:    string;
  rawText:    string;
  structured: {
    title:            string;
    required_skills:  string[];
    responsibilities: string[];
    seniority:        string;
  };
}
```

---

### `useAnalyzeJobText`

Analyzes a job listing provided as plain text.

```ts
import { useAnalyzeJobText } from "@/api";

const { mutate, data } = useAnalyzeJobText();

mutate("We are looking for a Senior Backend Developer...");
```

**Input:** `string` — raw job listing text, min 50 characters.

**Response:** same shape as `useAnalyzeJobFile`.

---

## Raw functions

Use these outside of React components (e.g. in utility scripts or server-side logic). Inside components, always prefer the hooks.

```ts
import { createApplication, uploadCVFile, uploadCVText, analyzeJobFile, analyzeJobText } from "@/api";

// All return promises and throw on error
const result = await createApplication({ cvText, jobText });
const cv = await uploadCVFile(file);
const job = await analyzeJobText("We are looking for...");
```

---

## Error handling

All errors are normalised to a plain `Error` with a human-readable message. You never need to inspect axios internals.

| Scenario                     | Message                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Network down                 | `"Network Error"`                                                                  |
| Request timeout (90s)        | `"Request timed out. Please try again."`                                           |
| Unauthorized (wrong API key) | `"Unauthorized."`                                                                  |
| Input too short              | `"cvText is too short to be valid."`                                               |
| Input too long               | `"cvText exceeds the 20000 character limit."`                                      |
| Server error                 | `"An unexpected error occurred."` (production) or the actual message (development) |

**Catching errors with `mutateAsync`**

```ts
try {
  const result = await mutateAsync({ cvText, jobText });
  // handle success
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message);
  }
}
```

---

## Rate limits

The backend enforces per-IP rate limits. Hitting them returns a `429` response which the interceptor surfaces as an error message.

| Endpoint                       | Limit                       |
| ------------------------------ | --------------------------- |
| `POST /api/application/create` | 10 requests per 15 minutes  |
| `POST /api/cv/upload`          | 20 requests per 10 minutes  |
| `POST /api/job/analyze`        | 20 requests per 10 minutes  |
| All routes (global)            | 100 requests per 15 minutes |

---

## Types

All types are exported from `@/api` and can be imported directly:

```ts
import type {
  CreateApplicationRequest,
  CreateApplicationResponse,
  ApplicationDocument,
  MatchResult,
  CVDocument,
  CVParsed,
  JobDocument,
  JobParsed,
  UploadCVResponse,
  AnalyzeJobResponse,
  ApiError,
} from "@/api";
```
