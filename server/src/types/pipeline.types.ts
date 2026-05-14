import type { MatchReport } from "./match.types.js";
import type { ApplicationLLMOutput } from "./application.types.js";
import { CVSchema, JobSchema } from "./schemas/schema.js";
import { z } from "zod";

export type PipelineResult = {
  cv: z.infer<typeof CVSchema>;
  job: z.infer<typeof JobSchema>;
  match: MatchReport;
  application: ApplicationLLMOutput;
};
