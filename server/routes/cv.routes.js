import express from "express";
import upload from "../middleware/upload.js";
import { parseCvPdf } from "../middleware/parseCvPdf.js";
import { uploadCV } from "../controllers/cv.controller.js";

const router = express.Router();

router.post("/upload", upload.single("cv"), parseCvPdf, uploadCV);

export default router;
