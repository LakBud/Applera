import express from "express";
import { createApplication } from "../controllers/application.controller.js";

const router = express.Router();

// POST /api/applications/create
// Body: { cvText: string, jobText: string }
router.post("/create", createApplication);

export default router;
