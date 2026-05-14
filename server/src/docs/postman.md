──────────────────────────────────────────────
API DOCUMENTATION (JOB APPLICATION SYSTEM)
──────────────────────────────────────────────

BASE URL:
http://localhost:PORT/api

(Replace PORT with your backend port, usually 3000 or 5000)

──────────────────────────────────────────────
AUTH
──────────────────────────────────────────────

All routes require:
req.identity

So in Postman you must simulate auth (depending on your setup):

Either JWT in headers
Or mocked middleware in dev

Header example:
Authorization: Bearer <token>

OR (if dev bypass exists):
just ensure identity middleware injects identity

──────────────────────────────────────────────
CV ENDPOINTS
──────────────────────────────────────────────

CREATE CV

POST /cv

Body (multipart/form-data):

file: PDF (optional)
cvText: string (optional)

Rules:

Either file OR cvText must be provided

Response:
{
message: "CV created successfully",
cv: { ... }
}

──────────────────────────────────────────────

GET ALL CVS

GET /cv

Response:
[
{
_id,
parsed,
createdAt
}
]

──────────────────────────────────────────────

GET CV BY ID

GET /cv/:id

Response:
{
\_id,
parsed,
rawText
}

──────────────────────────────────────────────

DELETE CV

DELETE /cv/:id

Response:
{
message: "CV deleted successfully"
}

──────────────────────────────────────────────
JOB ENDPOINTS
──────────────────────────────────────────────

CREATE JOB

POST /job

Body (multipart/form-data):

file: PDF (optional)
jobText: string (optional)

Response:
{
message: "Job created successfully",
job: { ... }
}

──────────────────────────────────────────────

GET ALL JOBS

GET /job

Response:
[
{ ...jobs }
]

──────────────────────────────────────────────

GET JOB BY ID

GET /job/:id

Response:
{
\_id,
parsed,
rawText
}

──────────────────────────────────────────────

DELETE JOB

DELETE /job/:id

Response:
{
message: "Job deleted successfully"
}

──────────────────────────────────────────────
APPLICATION ENDPOINTS
──────────────────────────────────────────────

CREATE APPLICATION

POST /application

Body (JSON):
{
"cvId": "string",
"jobId": "string"
}

What happens internally:

CV + Job fetched from DB
CV repaired (repairCV)
Job repaired (repairJob)
Match calculated (matchCVToJob)
LLM generates application (generateApplication)
Stored in DB

Response:
{
application: {
\_id,
match,
cover_letter,
application_email,
status
}
}

──────────────────────────────────────────────

GET ALL APPLICATIONS

GET /application

Response:
{
applications: [...]
}

──────────────────────────────────────────────

GET APPLICATION BY ID

GET /application/:id

Response:
{
application: { ... }
}

──────────────────────────────────────────────

UPDATE APPLICATION STATUS

PATCH /application/:id/status

Body:
{
"status": "generated" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn",
"notes": "optional string"
}

Response:
{
application: updatedApplication
}

──────────────────────────────────────────────

DELETE APPLICATION

DELETE /application/:id

Response:
{
message: "Application deleted"
}

──────────────────────────────────────────────
TRACKER ENDPOINTS (CV-BASED ANALYTICS)
──────────────────────────────────────────────

GET APPLICATIONS BY CV

GET /tracker/:cvId

Response:
{
applications: [...]
}

──────────────────────────────────────────────

GET SINGLE APPLICATION (TRACKER)

GET /tracker/application/:id

Response:
{
application: { ... }
}

──────────────────────────────────────────────

UPDATE STATUS (TRACKER)

PATCH /tracker/application/:id/status

Body:
{
"status": "...",
"notes": "optional"
}

Response:
{
application: updated
}

──────────────────────────────────────────────
DASHBOARD
──────────────────────────────────────────────

GET /dashboard/:cvId

Response:
{
cv_id,
total,
average_score,
highest_score,
best_match_id,
status_breakdown,
confidence_breakdown,
applications: [...]
}

──────────────────────────────────────────────
INTERVIEW PREP
──────────────────────────────────────────────

GENERATE INTERVIEW PREP

POST /interview/:applicationId

Response:
{
prep: {
questions: [...],
general_tips: [...]
}
}

──────────────────────────────────────────────

GET INTERVIEW PREP

GET /interview/:applicationId

Response:
{
prep: { ... }
}

──────────────────────────────────────────────
PIPELINE (INTERNAL ONLY)
──────────────────────────────────────────────

FUNCTION:
runApplicationPipeline(cvInput, jobInput)

Input:

Buffer OR string for CV
Buffer OR string for Job

Output:
{
cv,
job,
match,
application
}

NOT EXPOSED AS ROUTE (unless you add it)

──────────────────────────────────────────────
POSTMAN TESTING SETUP
──────────────────────────────────────────────

STEP 1: Set environment variable
BASE_URL = http://localhost:PORT/api

STEP 2: Add Authorization header (if needed)
Authorization: Bearer YOUR_TOKEN

STEP 3: Test order (IMPORTANT FLOW)

POST /cv
POST /job
POST /application
GET /application
PATCH /application/:id/status
GET /dashboard/:cvId

──────────────────────────────────────────────
COMMON ERRORS
──────────────────────────────────────────────

401 Unauthorized
→ missing req.identity

404 Not Found
→ wrong ID or not owned by user

400 Bad Request
→ missing cvId/jobId or invalid status

500 Internal Error
→ LLM failure / parsing / DB issue
