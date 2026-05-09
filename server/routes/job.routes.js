import express from "express";
import { analyzeJob } from "../controllers/job.controller.js";

const router = express.Router();

router.post("/analyze", analyzeJob);

export default router;
