import express from "express";
import { createApplication } from "../controllers/application.controller.js";

const router = express.Router();

router.post("/create", createApplication);

export default router;
