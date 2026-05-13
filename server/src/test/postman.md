# Backend Testing Guide (Postman)

## 1. Base Setup

**Base URL:**
http://localhost:5005

If deployed, replace with production URL.

**Headers (when needed):**

- Content-Type: application/json

If using Clerk authentication:

- Authorization header (if used by frontend)
- OR cookies (recommended in your setup)

---

## 2. Health Check

### GET /health

**URL:**
http://localhost:5005/health

**Response:**

```json
{
  "status": "ok"
}
```

---

## 3. Create Application (MAIN FLOW)

### POST /api/application/create

**URL:**
http://localhost:5005/api/application/create

### Body (Option A - full pipeline)

```json
{
  "cvText": "My CV text here...",
  "jobText": "Job description here..."
}
```

### Body (Option B - reuse CV)

```json
{
  "cvId": "YOUR_CV_ID",
  "jobText": "Job description here..."
}
```

**Response:**

```json
{
  "application": {},
  "cv": {},
  "job": {}
}
```

---

## 4. Dashboard

### GET /api/dashboard/:cvId

Example:
http://localhost:5005/api/dashboard/1234567890

**Response:**

```json
{
  "total": 0,
  "average_score": 0,
  "highest_score": 0,
  "applications": []
}
```

---

## 5. Tracker - Get Applications

### GET /api/tracker/:cvId

Example:
http://localhost:5005/api/tracker/1234567890

---

## 6. Tracker - Get Single Application

### GET /api/tracker/application/:id

Example:
http://localhost:5005/api/tracker/application/APP_ID

---

## 7. Update Application Status

### PATCH /api/tracker/application/:id/status

```json
{
  "status": "applied"
}
```

Optional:

```json
{
  "status": "interview",
  "notes": "Had first call"
}
```

---

## 8. Interview Prep - Generate

### POST /api/interview/generate

```json
{
  "applicationId": "APP_ID"
}
```

---

## 9. Interview Prep - Get

### GET /api/interview/:applicationId

---

## 10. Common Issues

- 401 Unauthorized → missing identity (Clerk or guest cookie not set)
- 404 CV not found → wrong cvId or ownership mismatch
- 500 ownerType error → model mismatch in createApplication
- empty response → DB not connected or pipeline failed

---

## 11. Recommended Test Flow

1. GET /health
2. POST /api/application/create
3. GET /api/dashboard/:cvId
4. GET /api/tracker/:cvId
5. PATCH status update
6. POST /api/interview/generate

---

Done.
