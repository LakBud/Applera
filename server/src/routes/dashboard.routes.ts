import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

// GET /api/dashboard/:cvId
router.get("/:cvId", getDashboard);

export default router;
