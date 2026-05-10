import { z } from "zod";

// ── CV Schema ─────────────────────────────────────────────
export const CVSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  github: z.string(),
  summary: z.string(),
  seniority_level: z.string(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      title: z.string(),
      school: z.string().default(""),
    }),
  ),
});

// ── Job Schema ─────────────────────────────────────────────
export const JobSchema = z.object({
  title: z.string(),
  required_skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  seniority: z.string(),
});

export type CVSchemaData = z.infer<typeof CVSchema>;
export type JobSchemaData = z.infer<typeof JobSchema>;
