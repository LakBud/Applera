import { generateApplication } from "../services/application.service.js";
import { matchCVToJob } from "../services/match.service.js";
import { CVSchemaData, JobSchemaData } from "./schema.js";

export type Input = Buffer | string;

type MatchResult = Awaited<ReturnType<typeof matchCVToJob>>;
type ApplicationResult = Awaited<ReturnType<typeof generateApplication>>;

export type PipelineResult = {
  cv: CVSchemaData;
  job: JobSchemaData;
  match: MatchResult;
  application: ApplicationResult;
};
