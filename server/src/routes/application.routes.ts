import express from "express";
import { createApplication } from "../controllers/application.controller.js";
import { applicationLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { aiTimeout } from "../middleware/timeout.js";
import { guestUsageLimiter } from "../middleware/usageLimiter.js";

const router = express.Router();

// POST /api/application/create
router.post(
  "/create",
  guestUsageLimiter, // 0. guest usage limit
  applicationLimiter, // 1. rate limit (strictest — 3 LLM calls)
  validate("createApplication"), // 2. reject malformed / type-coerced bodies
  aiTimeout, // 3. 90s hard deadline on the full request
  createApplication, // 4. controller
);

export default router;
