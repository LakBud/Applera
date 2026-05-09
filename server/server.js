import { connectDB } from "./db/db.js";
connectDB();
import express from "express";
import cors from "cors";

import cvRoutes from "./routes/cv.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";

const app = express();

// CORS configuration - must be BEFORE routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/cv", cvRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
