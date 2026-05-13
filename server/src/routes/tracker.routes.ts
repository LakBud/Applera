import express from "express";
import { getApplicationsByCv, getApplication, updateStatus } from "../controllers/tracker.controller.js";

const router = express.Router();

// GET  /api/tracker/:cvId              — all applications for a CV
router.get("/:cvId", getApplicationsByCv);

// GET  /api/tracker/application/:id   — single application (full)
router.get("/application/:id", getApplication);

// PATCH /api/tracker/application/:id/status
router.patch("/application/:id/status", updateStatus);

export default router;
